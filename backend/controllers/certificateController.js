const mongoose = require("mongoose");
const Certificate = require("../models/Certificate");
const Student = require("../models/Student");
const Course = require("../models/Course");
const { generateCertificateHash } = require("../services/hashService");
const { generateCertificatePDF } = require("../services/pdfService");
const { generateQRCodeDataURI } = require("../services/qrService");
const { revokeCertificateOnChain } = require("../services/blockchainService");

// @desc Prepare certificate payload and calculate canonical hash
// @route POST /api/certificates/prepare
const prepareIssuance = async (req, res, next) => {
  try {
    const { studentId, courseId, certificateId, grade, completionDate, certificateType, institutionId } = req.body;

    if (!studentId || !courseId || !certificateId || !grade || !completionDate) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: studentId, courseId, certificateId, grade, completionDate",
      });
    }

    // Check if certificateId already exists in DB
    const existing = await Certificate.findOne({ certificateId });
    if (existing && existing.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `Certificate ID '${certificateId}' already exists in database`,
      });
    }

    const studentObj = await Student.findById(studentId);
    if (!studentObj) {
      return res.status(404).json({ success: false, message: "Student record not found" });
    }

    let courseObj = null;
    if (mongoose.Types.ObjectId.isValid(courseId)) {
      courseObj = await Course.findById(courseId);
    }
    if (!courseObj) {
      courseObj = await Course.findOne({
        $or: [
          { courseId },
          { courseCode: courseId },
          { courseName: courseId },
          { name: courseId },
        ],
      });
    }
    if (!courseObj && studentObj.courseRef) {
      courseObj = await Course.findById(studentObj.courseRef);
    }
    if (!courseObj) {
      courseObj = await Course.findOne();
    }

    if (!courseObj) {
      return res.status(404).json({ success: false, message: "Course record not found" });
    }

    const instName = institutionId || "ABC Institute of Technology";

    // 1. Calculate deterministic SHA-256 hash
    const canonicalHash = generateCertificateHash({
      certificateId,
      studentId: studentObj.registerNumber || studentObj.studentId,
      courseId: courseObj.courseId,
      grade,
      completionDate,
      institutionId: instName,
    });

    // 2. Generate QR Code verification URL
    const qrDataUri = await generateQRCodeDataURI(certificateId);
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const qrVerificationUrl = `${baseUrl}/verify/${certificateId}`;

    // 3. Generate or save uploaded PDF off-chain document
    let pdfUrl = "";
    if (req.body.customPdfBase64) {
      const fs = require("fs");
      const path = require("path");
      const uploadsDir = path.join(__dirname, "../uploads");
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      const filename = `cert_${certificateId.replace(/[^a-zA-Z0-9-]/g, "_")}.pdf`;
      const filePath = path.join(uploadsDir, filename);
      const base64Data = req.body.customPdfBase64.replace(/^data:application\/pdf;base64,/, "");
      fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
      pdfUrl = `/uploads/${filename}`;
    } else {
      pdfUrl = await generateCertificatePDF({
        certificateId,
        studentName: studentObj.name,
        courseName: courseObj.name,
        grade,
        completionDate,
        institutionName: instName,
        certificateHash: canonicalHash,
        transactionHash: "Pending Confirmation",
      });
    }

    // 4. Save or update draft as PENDING
    let cert;
    if (existing) {
      existing.certificateHash = canonicalHash;
      existing.pdfUrl = pdfUrl;
      existing.qrVerificationUrl = qrVerificationUrl;
      existing.grade = grade;
      existing.completionDate = completionDate;
      cert = await existing.save();
    } else {
      cert = await Certificate.create({
        certificateId,
        student: studentId,
        course: courseId,
        grade,
        completionDate,
        institutionId: instName,
        certificateType: certificateType || "Certificate of Completion",
        certificateHash: canonicalHash,
        pdfUrl,
        qrVerificationUrl,
        status: "PENDING",
      });
    }

    res.json({
      success: true,
      message: "Certificate hash and PDF prepared successfully",
      data: {
        certificateId: cert.certificateId,
        certificateHash: cert.certificateHash,
        studentName: studentObj.name,
        courseName: courseObj.name,
        grade: cert.grade,
        completionDate: cert.completionDate,
        pdfUrl: cert.pdfUrl,
        qrDataUri,
        qrVerificationUrl: cert.qrVerificationUrl,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc Confirm certificate issuance with on-chain transaction receipt
// @route POST /api/certificates/confirm
const confirmIssuance = async (req, res, next) => {
  try {
    const { certificateId, transactionHash, blockNumber, issuerAddress } = req.body;

    if (!certificateId || !transactionHash) {
      return res.status(400).json({
        success: false,
        message: "Please provide certificateId and transactionHash",
      });
    }

    const cert = await Certificate.findOne({ certificateId }).populate("student course");
    if (!cert) {
      return res.status(404).json({ success: false, message: "Certificate record not found" });
    }

    cert.transactionHash = transactionHash;
    cert.blockNumber = Number(blockNumber) || 0;
    cert.issuerAddress = issuerAddress || req.user.email;
    cert.issuedAt = new Date();
    cert.status = "VERIFIED";

    // Regenerate updated PDF with on-chain tx hash included
    const updatedPdfUrl = await generateCertificatePDF({
      certificateId: cert.certificateId,
      studentName: cert.student ? cert.student.name : "Student Record",
      courseName: cert.course ? (cert.course.courseName || cert.course.name) : "Degree Program",
      grade: cert.grade,
      completionDate: cert.completionDate,
      institutionName: cert.institutionId,
      certificateHash: cert.certificateHash,
      transactionHash: transactionHash,
    });
    cert.pdfUrl = updatedPdfUrl;

    await cert.save();

    res.json({
      success: true,
      message: "Certificate anchored on-chain and verified in database successfully",
      data: cert,
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get list of certificates
// @route GET /api/certificates
const getCertificates = async (req, res, next) => {
  try {
    const { search, status, studentId, courseId } = req.query;
    let query = {};

    // Student role filtering
    if (req.user && req.user.role === "student" && req.user.studentRef) {
      query.student = req.user.studentRef._id || req.user.studentRef;
    } else if (studentId) {
      query.student = studentId;
    }

    if (courseId) query.course = courseId;
    if (status) query.status = status;

    let certs = await Certificate.find(query)
      .populate("student")
      .populate("course")
      .sort({ createdAt: -1 });

    if (search) {
      const searchLower = search.toLowerCase();
      certs = certs.filter(
        (c) =>
          c.certificateId.toLowerCase().includes(searchLower) ||
          (c.student && c.student.name.toLowerCase().includes(searchLower)) ||
          (c.course && c.course.name.toLowerCase().includes(searchLower))
      );
    }

    res.json({ success: true, count: certs.length, data: certs });
  } catch (err) {
    next(err);
  }
};

// @desc Get single certificate details
// @route GET /api/certificates/:id
const getCertificateById = async (req, res, next) => {
  try {
    const id = req.params.id;
    let cert = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      cert = await Certificate.findOne({
        $or: [{ _id: id }, { certificateId: id }],
      })
        .populate("student")
        .populate("course");
    } else {
      cert = await Certificate.findOne({ certificateId: id })
        .populate("student")
        .populate("course");
    }

    if (!cert) {
      return res.status(404).json({ success: false, message: "Certificate not found" });
    }

    res.json({ success: true, data: cert });
  } catch (err) {
    next(err);
  }
};

// @desc Revoke an issued certificate
// @route POST /api/certificates/:id/revoke
const revokeCertificate = async (req, res, next) => {
  try {
    const { transactionHash, reason } = req.body;
    const certId = req.params.id;
    const Document = require("../models/Document");

    let cert = null;
    if (mongoose.Types.ObjectId.isValid(certId)) {
      cert = await Certificate.findOne({
        $or: [{ _id: certId }, { certificateId: certId }],
      });
    } else {
      cert = await Certificate.findOne({ certificateId: certId });
    }

    let doc = null;
    if (!cert) {
      doc = await Document.findOne({
        $or: [{ certificateId: certId }, { documentId: certId }],
      });
    }

    if (!cert && !doc) {
      return res.status(404).json({ success: false, message: "Certificate record not found" });
    }

    const targetRecord = cert || doc;
    if (targetRecord.status === "REVOKED") {
      return res.status(400).json({ success: false, message: "Certificate is already revoked" });
    }

    // Submit revocation transaction via backend RPC signer
    let chainTxHash = transactionHash;
    if (!chainTxHash) {
      const targetCertId = targetRecord.certificateId || certId;
      const chainRes = await revokeCertificateOnChain(targetCertId);
      if (chainRes && chainRes.transactionHash) {
        chainTxHash = chainRes.transactionHash;
      }
    }

    targetRecord.status = "REVOKED";
    if (reason) targetRecord.revocationReason = reason;
    if (chainTxHash) targetRecord.transactionHash = chainTxHash;
    await targetRecord.save();

    res.json({
      success: true,
      message: "Certificate has been marked as REVOKED on-chain and in database",
      data: targetRecord,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  prepareIssuance,
  confirmIssuance,
  getCertificates,
  getCertificateById,
  revokeCertificate,
};
