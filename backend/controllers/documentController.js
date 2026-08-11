const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const Student = require("../models/Student");
const Document = require("../models/Document");
const { uploadToIPFS } = require("../services/ipfsService");
const { generateQRCodeDataURI } = require("../services/qrService");
const { updateStudentCryptoRecord } = require("../services/studentCryptoService");

/**
 * Sort documents deterministically by semester and document type
 */
function sortStudentDocuments(docs) {
  const semesterOrder = {
    "Semester 1": 1,
    "Semester 2": 2,
    "Semester 3": 3,
    "Semester 4": 4,
    "Semester 5": 5,
    "Semester 6": 6,
    "Semester 7": 7,
    "Semester 8": 8,
    "N/A": 9,
  };

  return docs.sort((a, b) => {
    if (a.documentType === "Final Degree Certificate" && b.documentType !== "Final Degree Certificate") return 1;
    if (a.documentType !== "Final Degree Certificate" && b.documentType === "Final Degree Certificate") return -1;
    const orderA = semesterOrder[a.semester] || 99;
    const orderB = semesterOrder[b.semester] || 99;
    return orderA - orderB;
  });
}

// @desc Upload academic document (PDF/JPG/PNG) to IPFS, compute SHA-256 hash, and update Student Cryptographic Record
// @route POST /api/documents/upload
const uploadDocument = async (req, res, next) => {
  try {
    const { studentId, documentType, semester } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please select an academic document file to upload" });
    }

    if (!studentId || !documentType) {
      return res.status(400).json({ success: false, message: "Missing required fields: studentId and documentType" });
    }

    // 1. Fetch student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student record not found" });
    }

    // 2. Validate file format (PDF, JPG, JPEG, PNG)
    const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file format. Only PDF, JPG, JPEG, and PNG files are allowed.",
      });
    }

    // 3. Calculate SHA-256 cryptographic hash from raw file buffer
    const sha256Hash = crypto.createHash("sha256").update(req.file.buffer).digest("hex");
    const documentHash = "0x" + sha256Hash;

    // 4. Pin/upload actual file buffer to IPFS
    const ipfsResult = await uploadToIPFS(req.file.buffer, req.file.originalname, req.file.mimetype);

    // Save local copy in uploads/ directory for offline fallback
    const uploadsDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    const localFilename = `doc_${student.registerNumber}_${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const localFilePath = path.join(uploadsDir, localFilename);
    fs.writeFileSync(localFilePath, req.file.buffer);

    // 5. Generate System Certificate ID (BCERT-TN-YYYY-XXXXXX)
    const year = new Date().getFullYear();
    const docCount = await Document.countDocuments();
    const certSeq = String(docCount + 1).padStart(6, "0");
    const certificateId = `BCERT-TN-${year}-${certSeq}`;
    const documentId = `DOC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 6. Create Document record in DB
    const docRecord = await Document.create({
      certificateId,
      documentId,
      student: student._id,
      studentId: student.studentId || student.registerNumber,
      college: student.college,
      department: student.departmentRef,
      course: student.courseRef,
      batch: student.batchRef,
      documentType,
      semester: semester || "N/A",
      fileName: req.file.originalname,
      originalFilename: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      sha256Hash,
      documentHash,
      ipfsCid: ipfsResult.cid,
      ipfsUrl: ipfsResult.gatewayUrl,
      localFilePath: `/uploads/${localFilename}`,
      uploadedBy: req.user ? req.user.name : "College Administrator",
      uploadedAt: new Date(),
      status: "ACTIVE",
      verificationStatus: "STORED",
    });

    // 7. Update Student Cryptographic Record with aggregated document hashes
    const cryptoRecord = await updateStudentCryptoRecord(student._id, student.batchRef);

    // 8. Assign primary Certificate ID / QR Code to student if not already present
    if (!student.academicRecordId) {
      student.academicRecordId = certificateId;
    }
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const qrVerificationUrl = `${baseUrl}/verify/${certificateId}`;
    const qrCodeDataUri = await generateQRCodeDataURI(certificateId);

    student.qrCodeUrl = qrVerificationUrl;
    student.merkleRoot = cryptoRecord.studentRecordHash;
    await student.save();

    res.status(201).json({
      success: true,
      message: "Academic document uploaded to IPFS and registered in database successfully",
      data: {
        certificateId,
        document: docRecord,
        sha256Hash,
        ipfsCid: ipfsResult.cid,
        ipfsUrl: ipfsResult.gatewayUrl,
        studentRecordHash: cryptoRecord.studentRecordHash,
        qrCodeUrl: qrVerificationUrl,
        qrDataUri: qrCodeDataUri,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get all uploaded documents for a student
// @route GET /api/documents/student/:studentId
const getStudentDocuments = async (req, res, next) => {
  try {
    const student = await Student.findOne({
      $or: [{ _id: req.params.studentId }, { studentId: req.params.studentId }, { registerNumber: req.params.studentId }],
    });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student record not found" });
    }

    let documents = await Document.find({ student: student._id, status: "ACTIVE" });
    documents = sortStudentDocuments(documents);

    res.json({
      success: true,
      count: documents.length,
      student: {
        _id: student._id,
        name: student.name,
        registerNumber: student.registerNumber,
        department: student.department,
        degree: student.degree,
        institution: student.institution,
        university: student.university,
        batch: student.batch,
        academicRecordId: student.academicRecordId,
        merkleRoot: student.merkleRoot,
        qrCodeUrl: student.qrCodeUrl,
      },
      data: documents,
    });
  } catch (err) {
    next(err);
  }
};

// @desc Serve locally cached IPFS document file
// @route GET /api/documents/ipfs/:cid
const serveIpfsFile = async (req, res, next) => {
  try {
    const cid = req.params.cid;
    const doc = await Document.findOne({ ipfsCid: cid });
    if (doc && doc.localFilePath) {
      const fullPath = path.join(__dirname, "..", doc.localFilePath);
      if (fs.existsSync(fullPath)) {
        return res.sendFile(fullPath);
      }
    }

    res.status(404).send("File not found on IPFS cache gateway");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadDocument,
  getStudentDocuments,
  serveIpfsFile,
};
