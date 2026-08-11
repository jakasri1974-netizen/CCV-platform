const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema(
  {
    courseId: { type: String, required: true, unique: true, trim: true },
    college: { type: mongoose.Schema.Types.ObjectId, ref: "College" },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    courseCode: { type: String, default: "" },
    courseName: { type: String, required: true, trim: true },
    degreeType: { type: String, default: "B.E" }, // B.E, B.Tech, M.E, MCA, M.Tech, B.Sc
    description: { type: String, default: "" },
    duration: { type: String, default: "4 Years" },
    credits: { type: Number, default: 4 },
    instructor: { type: String, default: "Head of Department" },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", CourseSchema);
