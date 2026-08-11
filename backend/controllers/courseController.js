const mongoose = require("mongoose");
const Course = require("../models/Course");
const College = require("../models/College");
const Department = require("../models/Department");

// @desc Get courses (strictly filtered by departmentId or collegeId)
// @route GET /api/courses or GET /api/departments/:departmentId/courses
const getCourses = async (req, res, next) => {
  try {
    const departmentId = req.params.departmentId || req.query.departmentId;
    const collegeId = req.query.collegeId;
    const { search } = req.query;
    let query = {};

    if (departmentId) {
      let dept = null;
      if (mongoose.Types.ObjectId.isValid(departmentId)) {
        dept = await Department.findById(departmentId);
      }
      if (!dept) {
        dept = await Department.findOne({ $or: [{ departmentId }, { departmentCode: departmentId }] });
      }
      if (dept) query.department = dept._id;
      else return res.json({ success: true, count: 0, data: [] });
    }

    if (collegeId) {
      let col = null;
      if (mongoose.Types.ObjectId.isValid(collegeId)) {
        col = await College.findById(collegeId);
      }
      if (!col) {
        col = await College.findOne({ $or: [{ collegeId }, { collegeCode: collegeId }] });
      }
      if (col) query.college = col._id;
    }

    if (search) {
      query.$or = [
        { courseName: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { courseId: { $regex: search, $options: "i" } },
        { degreeType: { $regex: search, $options: "i" } },
      ];
    }

    const courses = await Course.find(query).populate("college department").sort({ courseName: 1 });
    res.json({ success: true, count: courses.length, data: courses });
  } catch (err) {
    next(err);
  }
};

// @desc Get single course
// @route GET /api/courses/:id
const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate("college department");
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    res.json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};

// @desc Create course
// @route POST /api/courses
const createCourse = async (req, res, next) => {
  try {
    const { courseId, name, courseName, collegeId, departmentId, degreeType, duration, credits } = req.body;

    const cName = courseName || name;
    if (!cName) {
      return res.status(400).json({ success: false, message: "Course name is required" });
    }

    const cId = courseId || `CRS-${Date.now()}`;

    let collegeRef = null;
    if (collegeId) {
      if (mongoose.Types.ObjectId.isValid(collegeId)) {
        const col = await College.findById(collegeId);
        if (col) collegeRef = col._id;
      } else {
        const col = await College.findOne({ $or: [{ collegeId }, { collegeCode: collegeId }] });
        if (col) collegeRef = col._id;
      }
    }

    let deptRef = null;
    if (departmentId) {
      if (mongoose.Types.ObjectId.isValid(departmentId)) {
        const dept = await Department.findById(departmentId);
        if (dept) deptRef = dept._id;
      } else {
        const dept = await Department.findOne({ $or: [{ departmentId }, { departmentCode: departmentId }] });
        if (dept) deptRef = dept._id;
      }
    }

    const course = await Course.create({
      courseId: cId,
      courseName: cName,
      name: cName,
      college: collegeRef,
      department: deptRef,
      degreeType: degreeType || "B.E",
      duration: duration || "4 Years",
      credits: Number(credits) || 4,
    });

    res.status(201).json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};

// @desc Update course
// @route PUT /api/courses/:id
const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    res.json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};

// @desc Delete course
// @route DELETE /api/courses/:id
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    res.json({ success: true, message: "Course deleted successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
};
