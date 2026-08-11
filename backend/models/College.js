const mongoose = require("mongoose");

const CollegeSchema = new mongoose.Schema(
  {
    collegeId: { type: String, required: true, unique: true, trim: true, index: true },
    collegeCode: { type: String, required: true, unique: true, trim: true, index: true },
    collegeName: { type: String, required: true, trim: true, index: true },
    state: { type: String, default: "Tamil Nadu", index: true },
    district: { type: String, default: "Chennai", index: true },
    university: { type: String, default: "Anna University", index: true },
    address: { type: String, default: "" },
    location: { type: String, default: "Campus" },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("College", CollegeSchema);
