const mongoose = require("mongoose");

const BatchSchema = new mongoose.Schema(
  {
    batchId: { type: String, required: true, unique: true, trim: true },
    college: { type: mongoose.Schema.Types.ObjectId, ref: "College" },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    name: { type: String, required: true, trim: true }, // e.g. 2023-2027
    academicYear: { type: String, default: "2023-2027" },
    startYear: { type: Number, default: 2023 },
    endYear: { type: Number, default: 2027 },
    totalCertificates: { type: Number, default: 0 },
    merkleRoot: { type: String, default: "" },
    transactionHash: { type: String, default: "" },
    blockNumber: { type: Number, default: 0 },
    issuerAddress: { type: String, default: "" },
    status: {
      type: String,
      enum: ["ACTIVE", "PENDING", "GENERATED", "ANCHORED", "FAILED", "REVOKED"],
      default: "ACTIVE",
    },
    anchoredAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Batch", BatchSchema);
