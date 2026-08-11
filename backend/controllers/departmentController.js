const mongoose = require("mongoose");
const Department = require("../models/Department");
const College = require("../models/College");

// @desc Get departments (strictly filtered by collegeId query or route parameter)
// @route GET /api/departments or GET /api/colleges/:collegeId/departments
const getDepartments = async (req, res, next) => {
  try {
    const collegeId = req.params.collegeId || req.query.collegeId;
    const { search } = req.query;
    let query = {};

    if (collegeId) {
      let col = null;
      if (mongoose.Types.ObjectId.isValid(collegeId)) {
        col = await College.findById(collegeId);
      }
      if (!col) {
        col = await College.findOne({ $or: [{ collegeId }, { collegeCode: collegeId }] });
      }
      if (col) query.college = col._id;
      else return res.json({ success: true, count: 0, data: [] });
    }

    if (search) {
      query.$or = [
        { departmentName: { $regex: search, $options: "i" } },
        { departmentCode: { $regex: search, $options: "i" } },
      ];
    }

    const departments = await Department.find(query).populate("college").sort({ departmentName: 1 });
    res.json({ success: true, count: departments.length, data: departments });
  } catch (err) {
    next(err);
  }
};

// @desc Create department for a college
// @route POST /api/departments
const createDepartment = async (req, res, next) => {
  try {
    const { collegeId, departmentCode, departmentName } = req.body;
    if (!collegeId || !departmentCode || !departmentName) {
      return res.status(400).json({ success: false, message: "Missing required fields: collegeId, departmentCode, departmentName" });
    }

    let collegeRef = null;
    if (mongoose.Types.ObjectId.isValid(collegeId)) {
      const college = await College.findById(collegeId);
      if (college) collegeRef = college._id;
    }
    if (!collegeRef) {
      const college = await College.findOne({ $or: [{ collegeId }, { collegeCode: collegeId }] });
      if (college) collegeRef = college._id;
    }

    if (!collegeRef) return res.status(404).json({ success: false, message: "College not found" });

    const departmentId = `DEP-${departmentCode.toUpperCase()}-${Date.now()}`;
    const department = await Department.create({
      departmentId,
      college: collegeRef,
      departmentCode: departmentCode.toUpperCase(),
      departmentName,
    });

    res.status(201).json({ success: true, data: department });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDepartments,
  createDepartment,
};
