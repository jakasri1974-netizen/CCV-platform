const mongoose = require("mongoose");
const Batch = require("../models/Batch");
const Student = require("../models/Student");
const Document = require("../models/Document");
const StudentCryptographicRecord = require("../models/StudentCryptographicRecord");
const BatchAnchor = require("../models/BatchAnchor");
const College = require("../models/College");
const Department = require("../models/Department");
const Course = require("../models/Course");
const { buildMerkleTree, getMerkleProof } = require("../services/merkleService");
const { anchorBatchOnChain } = require("../services/blockchainService");

// @desc Get all certificate batches with cascading query support
// @route GET /api/batches or GET /api/courses/:courseId/batches
const getBatches = async (req, res, next) => {
  try {
    const courseId = req.params.courseId || req.query.courseId;
    const { collegeId, departmentId, search } = req.query;
    let query = {};

    if (courseId) {
      let crs = null;
      if (mongoose.Types.ObjectId.isValid(courseId)) crs = await Course.findById(courseId);
      if (!crs) crs = await Course.findOne({ $or: [{ courseId }] });
      if (crs) query.course = crs._id;
      else return res.json({ success: true, count: 0, data: [] });
    }

    if (collegeId) {
      let col = null;
      if (mongoose.Types.ObjectId.isValid(collegeId)) col = await College.findById(collegeId);
      if (!col) col = await College.findOne({ $or: [{ collegeId }, { collegeCode: collegeId }] });
      if (col) query.college = col._id;
    }

    if (departmentId) {
      let dept = null;
      if (mongoose.Types.ObjectId.isValid(departmentId)) dept = await Department.findById(departmentId);
      if (!dept) dept = await Department.findOne({ $or: [{ departmentId }, { departmentCode: departmentId }] });
      if (dept) query.department = dept._id;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { academicYear: { $regex: search, $options: "i" } },
        { batchId: { $regex: search, $options: "i" } },
      ];
    }

    const batches = await Batch.find(query).populate("college department course").sort({ createdAt: -1 });
    res.json({ success: true, count: batches.length, data: batches });
  } catch (err) {
    next(err);
  }
};

// @desc Get single batch details with student & anchor stats
// @route GET /api/batches/:batchId
const getBatchById = async (req, res, next) => {
  try {
    let batch = null;
    if (mongoose.Types.ObjectId.isValid(req.params.batchId)) {
      batch = await Batch.findById(req.params.batchId).populate("college department course");
    }
    if (!batch) {
      batch = await Batch.findOne({ batchId: req.params.batchId }).populate("college department course");
    }

    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch record not found" });
    }

    const studentsCount = await Student.countDocuments({ batchRef: batch._id });
    const documentsCount = await Document.countDocuments({ batch: batch._id });
    const anchors = await BatchAnchor.find({ batchId: batch._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        batch,
        studentsCount,
        documentsCount,
        latestAnchor: anchors[0] || null,
        anchorsCount: anchors.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc Create a new batch
// @route POST /api/batches
const createBatch = async (req, res, next) => {
  try {
    const { batchId, name, academicYear, collegeId, departmentId, courseId, startYear, endYear } = req.body;

    const bName = name || academicYear || "2023-2027";
    const bId = batchId || `BATCH-${Date.now()}`;

    let colRef = null, deptRef = null, crsRef = null;
    if (collegeId) {
      if (mongoose.Types.ObjectId.isValid(collegeId)) colRef = await College.findById(collegeId);
      if (!colRef) colRef = await College.findOne({ $or: [{ collegeId }, { collegeCode: collegeId }] });
      if (colRef) colRef = colRef._id;
    }
    if (departmentId) {
      if (mongoose.Types.ObjectId.isValid(departmentId)) deptRef = await Department.findById(departmentId);
      if (!deptRef) deptRef = await Department.findOne({ $or: [{ departmentId }, { departmentCode: departmentId }] });
      if (deptRef) deptRef = deptRef._id;
    }
    if (courseId) {
      if (mongoose.Types.ObjectId.isValid(courseId)) crsRef = await Course.findById(courseId);
      if (!crsRef) crsRef = await Course.findOne({ $or: [{ courseId }] });
      if (crsRef) crsRef = crsRef._id;
    }

    const batch = await Batch.create({
      batchId: bId,
      name: bName,
      academicYear: academicYear || bName,
      college: colRef,
      department: deptRef,
      course: crsRef,
      startYear: Number(startYear) || 2023,
      endYear: Number(endYear) || 2027,
      merkleVersion: 1,
      status: "ACTIVE",
    });

    res.status(201).json({ success: true, data: batch });
  } catch (err) {
    next(err);
  }
};

// @desc Build Merkle Tree from Student Cryptographic Records, compute Root & Update Version
// @route POST /api/batches/:batchId/generate-root
const generateBatchMerkleRoot = async (req, res, next) => {
  try {
    const param = req.params.batchId;
    let batch = null;
    if (mongoose.Types.ObjectId.isValid(param)) {
      batch = await Batch.findById(param);
    }
    if (!batch) {
      batch = await Batch.findOne({ batchId: param });
    }

    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }

    // Get all student crypto records for this batch
    const students = await Student.find({ batchRef: batch._id });
    if (students.length === 0) {
      return res.status(400).json({
        success: false,
        message: `No students assigned to batch '${batch.name}'. Please add students first.`,
      });
    }

    const studentIds = students.map((s) => s._id);
    const cryptoRecords = await StudentCryptographicRecord.find({ studentId: { $in: studentIds } });

    // Collect studentRecordHashes
    const leafHashes = cryptoRecords.map((r) => r.studentRecordHash).filter(Boolean);

    if (leafHashes.length === 0) {
      // If no document hashes yet, generate deterministic student hashes from register numbers
      students.forEach((s) => {
        const h = require("crypto").createHash("sha256").update(`STUDENT_${s.registerNumber}_${s._id}`).digest("hex");
        leafHashes.push(h);
      });
    }

    const tree = buildMerkleTree(leafHashes);
    const merkleRoot = tree.root;

    // Check if merkleRoot changed to increment version
    if (batch.merkleRoot && batch.merkleRoot !== merkleRoot) {
      batch.merkleVersion = (batch.merkleVersion || 1) + 1;
    }

    batch.merkleRoot = merkleRoot;
    batch.totalCertificates = await Document.countDocuments({ batch: batch._id });
    batch.status = "GENERATED";
    await batch.save();

    res.json({
      success: true,
      message: `Successfully constructed Merkle Tree (Version ${batch.merkleVersion}) for ${students.length} students`,
      data: {
        batchId: batch.batchId,
        merkleRoot: batch.merkleRoot,
        merkleVersion: batch.merkleVersion,
        totalStudents: students.length,
        totalDocuments: batch.totalCertificates,
        treeLayersCount: tree.layers.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc Submit Polygon blockchain anchoring transaction via backend wallet signer
// @route POST /api/batches/:batchId/anchor
const anchorBatchOnPolygon = async (req, res, next) => {
  try {
    const param = req.params.batchId;
    let batch = null;
    if (mongoose.Types.ObjectId.isValid(param)) {
      batch = await Batch.findById(param);
    }
    if (!batch) {
      batch = await Batch.findOne({ batchId: param });
    }

    if (!batch || !batch.merkleRoot) {
      return res.status(400).json({
        success: false,
        message: "Please generate a Merkle Root for this batch before anchoring to Polygon blockchain",
      });
    }

    const studentCount = await Student.countDocuments({ batchRef: batch._id });
    const documentCount = await Document.countDocuments({ batch: batch._id });

    // Submit transaction via backend Polygon RPC signer
    const chainResult = await anchorBatchOnChain(
      batch.batchId,
      batch.merkleRoot,
      studentCount,
      batch.merkleVersion || 1
    );

    // Save Anchor receipt in MongoDB
    const anchorReceipt = await BatchAnchor.create({
      batchId: batch._id,
      merkleRoot: batch.merkleRoot,
      studentCount,
      documentCount,
      network: "Polygon Amoy Testnet",
      chainId: 80002,
      contractAddress: chainResult.contractAddress || process.env.CONTRACT_ADDRESS,
      transactionHash: chainResult.transactionHash,
      blockNumber: chainResult.blockNumber || 0,
      anchoredAt: new Date(),
      status: chainResult.success ? "CONFIRMED" : "FAILED",
      merkleVersion: batch.merkleVersion || 1,
    });

    batch.anchored = true;
    batch.transactionHash = chainResult.transactionHash;
    batch.blockNumber = chainResult.blockNumber || 0;
    batch.status = "ANCHORED";
    await batch.save();

    res.json({
      success: true,
      message: `Batch Merkle Root anchored on Polygon Amoy blockchain! Transaction: ${chainResult.transactionHash}`,
      data: {
        batch,
        anchorReceipt,
        chainResult,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getBatches,
  getBatchById,
  createBatch,
  generateBatchMerkleRoot,
  anchorBatchOnPolygon,
};
