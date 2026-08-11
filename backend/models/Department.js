const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema(
  {
    departmentId: { type: String, required: true, unique: true, trim: true },
    college: { type: mongoose.Schema.Types.ObjectId, ref: "College", required: true },
    departmentCode: { type: String, required: true, trim: true },
    departmentName: { type: String, required: true, trim: true },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Department", DepartmentSchema);
