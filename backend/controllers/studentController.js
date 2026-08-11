const mongoose = require("mongoose");
const Student = require("../models/Student");
const College = require("../models/College");
const Department = require("../models/Department");
const Course = require("../models/Course");
const Batch = require("../models/Batch");

// @desc Get students with cascading query filters & server-side pagination for 8000+ records
// @route GET /api/students or GET /api/batches/:batchId/students
const getStudents = async (req, res, next) => {
  try {
    const batchIdParam = req.params.batchId || req.query.batchId;
    const { search, collegeId, departmentId, courseId, page = 1, limit = 50 } = req.query;
    let query = {};

    // Role-based filtering for College Admins
    if (req.user && req.user.role === "college_admin" && req.user.collegeRef) {
      query.college = req.user.collegeRef._id || req.user.collegeRef;
    } else if (collegeId) {
      let col = null;
      if (mongoose.Types.ObjectId.isValid(collegeId)) col = await College.findById(collegeId);
      if (!col) col = await College.findOne({ $or: [{ collegeId }, { collegeCode: collegeId }] });
      if (col) query.college = col._id;
    }

    if (departmentId) {
      let dept = null;
      if (mongoose.Types.ObjectId.isValid(departmentId)) dept = await Department.findById(departmentId);
      if (!dept) dept = await Department.findOne({ $or: [{ departmentId }, { departmentCode: departmentId }] });
      if (dept) query.departmentRef = dept._id;
    }

    if (courseId) {
      let crs = null;
      if (mongoose.Types.ObjectId.isValid(courseId)) crs = await Course.findById(courseId);
      if (!crs) crs = await Course.findOne({ $or: [{ courseId }] });
      if (crs) query.courseRef = crs._id;
    }

    if (batchIdParam) {
      let bch = null;
      if (mongoose.Types.ObjectId.isValid(batchIdParam)) bch = await Batch.findById(batchIdParam);
      if (!bch) bch = await Batch.findOne({ $or: [{ batchId: batchIdParam }, { name: batchIdParam }, { academicYear: batchIdParam }] });
      if (bch) query.batchRef = bch._id;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { registerNumber: { $regex: search, $options: "i" } },
        { studentId: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(500, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .populate("college departmentRef courseRef batchRef")
      .sort({ registerNumber: 1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: students.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: students,
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get single student
// @route GET /api/students/:id
const getStudentById = async (req, res, next) => {
  try {
    let student = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      student = await Student.findById(req.params.id).populate("college departmentRef courseRef batchRef");
    }
    if (!student) {
      student = await Student.findOne({
        $or: [
          { studentId: req.params.id },
          { registerNumber: req.params.id },
        ],
      }).populate("college departmentRef courseRef batchRef");
    }

    if (!student) {
      return res.status(404).json({ success: false, message: "Student record not found" });
    }
    res.json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

// @desc Create new student manually
// @route POST /api/students
const createStudent = async (req, res, next) => {
  try {
    let {
      studentId,
      registerNumber,
      name,
      email,
      phone,
      collegeId,
      departmentId,
      courseId,
      batchId,
    } = req.body;

    if (!registerNumber || !name || !email) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: registerNumber, name, and email are required.",
      });
    }

    const cleanReg = registerNumber.trim().toUpperCase();
    if (!studentId) studentId = `STU-${cleanReg}`;

    const existing = await Student.findOne({
      $or: [{ studentId }, { registerNumber: cleanReg }],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Student with Register Number '${cleanReg}' already exists in database`,
      });
    }

    let colObj = null, deptObj = null, crsObj = null, bchObj = null;
    if (collegeId) {
      if (mongoose.Types.ObjectId.isValid(collegeId)) colObj = await College.findById(collegeId);
      if (!colObj) colObj = await College.findOne({ $or: [{ collegeId }, { collegeCode: collegeId }] });
    }
    if (departmentId) {
      if (mongoose.Types.ObjectId.isValid(departmentId)) deptObj = await Department.findById(departmentId);
      if (!deptObj) deptObj = await Department.findOne({ $or: [{ departmentId }, { departmentCode: departmentId }] });
    }
    if (courseId) {
      if (mongoose.Types.ObjectId.isValid(courseId)) crsObj = await Course.findById(courseId);
      if (!crsObj) crsObj = await Course.findOne({ $or: [{ courseId }] });
    }
    if (batchId) {
      if (mongoose.Types.ObjectId.isValid(batchId)) bchObj = await Batch.findById(batchId);
      if (!bchObj) bchObj = await Batch.findOne({ $or: [{ batchId }] });
    }

    const student = await Student.create({
      studentId,
      registerNumber: cleanReg,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || "",
      college: colObj ? colObj._id : null,
      departmentRef: deptObj ? deptObj._id : null,
      courseRef: crsObj ? crsObj._id : null,
      batchRef: bchObj ? bchObj._id : null,
      department: deptObj ? deptObj.departmentName : "Computer Science and Engineering",
      degree: crsObj ? crsObj.courseName : "B.E Computer Science and Engineering",
      institution: colObj ? colObj.collegeName : "College of Engineering Guindy",
      university: colObj ? colObj.university : "Anna University",
      batch: bchObj ? bchObj.name : "2023-2027",
      graduationYear: bchObj ? bchObj.endYear : 2027,
    });

    res.status(201).json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

// @desc Bulk Import Student List via CSV / JSON text with preview stats
// @route POST /api/students/import
const importStudentsCsv = async (req, res, next) => {
  try {
    const { csvData, studentsList, collegeId, departmentId, courseId, batchId } = req.body;

    let recordsToProcess = [];

    if (Array.isArray(studentsList) && studentsList.length > 0) {
      recordsToProcess = studentsList;
    } else if (typeof csvData === "string" && csvData.trim()) {
      const lines = csvData.trim().split(/\r?\n/);
      if (lines.length === 0) {
        return res.status(400).json({ success: false, message: "CSV content is empty" });
      }

      const firstLine = lines[0].toLowerCase();
      const hasHeader = firstLine.includes("reg") || firstLine.includes("name") || firstLine.includes("email");
      const startIndex = hasHeader ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(",").map((p) => p.trim().replace(/^["']|["']$/g, ""));
        if (parts.length >= 2) {
          recordsToProcess.push({
            registerNumber: parts[0],
            name: parts[1],
            email: parts[2] || `student_${parts[0].toLowerCase()}@example.com`,
            phone: parts[3] || "",
          });
        }
      }
    }

    if (recordsToProcess.length === 0) {
      return res.status(400).json({ success: false, message: "No valid student records found in import data" });
    }

    let colObj = null, deptObj = null, crsObj = null, bchObj = null;
    if (collegeId) {
      if (mongoose.Types.ObjectId.isValid(collegeId)) colObj = await College.findById(collegeId);
      if (!colObj) colObj = await College.findOne({ $or: [{ collegeId }, { collegeCode: collegeId }] });
    }
    if (departmentId) {
      if (mongoose.Types.ObjectId.isValid(departmentId)) deptObj = await Department.findById(departmentId);
      if (!deptObj) deptObj = await Department.findOne({ $or: [{ departmentId }, { departmentCode: departmentId }] });
    }
    if (courseId) {
      if (mongoose.Types.ObjectId.isValid(courseId)) crsObj = await Course.findById(courseId);
      if (!crsObj) crsObj = await Course.findOne({ $or: [{ courseId }] });
    }
    if (batchId) {
      if (mongoose.Types.ObjectId.isValid(batchId)) bchObj = await Batch.findById(batchId);
      if (!bchObj) bchObj = await Batch.findOne({ $or: [{ batchId }] });
    }

    const existingRegNumbers = new Set((await Student.find({}, "registerNumber")).map((s) => s.registerNumber.toUpperCase()));

    let validCount = 0;
    let duplicateCount = 0;
    let invalidCount = 0;
    const newStudentsToInsert = [];
    const previewRecords = [];

    for (const rec of recordsToProcess) {
      const reg = String(rec.registerNumber || "").trim().toUpperCase();
      const name = String(rec.name || "").trim();
      const email = String(rec.email || `student_${reg.toLowerCase()}@example.com`).trim();

      if (!reg || !name) {
        invalidCount++;
        previewRecords.push({ registerNumber: reg || "N/A", name: name || "N/A", status: "INVALID" });
        continue;
      }

      if (existingRegNumbers.has(reg)) {
        duplicateCount++;
        previewRecords.push({ registerNumber: reg, name, status: "DUPLICATE" });
        continue;
      }

      existingRegNumbers.add(reg);
      validCount++;

      newStudentsToInsert.push({
        studentId: `STU-${reg}`,
        registerNumber: reg,
        name,
        email,
        phone: rec.phone || "",
        college: colObj ? colObj._id : null,
        departmentRef: deptObj ? deptObj._id : null,
        courseRef: crsObj ? crsObj._id : null,
        batchRef: bchObj ? bchObj._id : null,
        department: deptObj ? deptObj.departmentName : "Computer Science and Engineering",
        degree: crsObj ? crsObj.courseName : "B.E Computer Science and Engineering",
        institution: colObj ? colObj.collegeName : "College of Engineering Guindy",
        university: colObj ? colObj.university : "Anna University",
        batch: bchObj ? bchObj.name : "2023-2027",
        graduationYear: bchObj ? bchObj.endYear : 2027,
      });

      previewRecords.push({ registerNumber: reg, name, status: "VALID" });
    }

    let insertedDocs = [];
    if (newStudentsToInsert.length > 0) {
      insertedDocs = await Student.insertMany(newStudentsToInsert);
    }

    res.json({
      success: true,
      message: `Bulk import completed! ${validCount} students added, ${duplicateCount} duplicates skipped, ${invalidCount} invalid lines.`,
      stats: {
        totalRecords: recordsToProcess.length,
        validCount,
        duplicateCount,
        invalidCount,
        insertedCount: insertedDocs.length,
      },
      preview: previewRecords.slice(0, 50),
    });
  } catch (err) {
    next(err);
  }
};

// @desc Update student
// @route PUT /api/students/:id
const updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student record not found" });
    }
    res.json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

// @desc Delete student
// @route DELETE /api/students/:id
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student record not found" });
    }
    res.json({ success: true, message: "Student deleted successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  importStudentsCsv,
  updateStudent,
  deleteStudent,
};
