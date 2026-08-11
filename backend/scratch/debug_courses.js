const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const connectDB = require('../config/db');
const Course = require('../models/Course');
const Department = require('../models/Department');
const College = require('../models/College');

async function debugCourses() {
  await connectDB();
  const courses = await Course.find();
  console.log("ALL COURSES IN DB:", JSON.stringify(courses, null, 2));

  const cseDept = await Department.findOne({ departmentCode: "CSE" });
  console.log("CSE DEPT IN DB:", cseDept);

  const matched = await Course.find({ department: cseDept._id });
  console.log("MATCHED COURSES BY DEPT OBJECTID:", matched.length);

  process.exit(0);
}

debugCourses().catch(console.error);
