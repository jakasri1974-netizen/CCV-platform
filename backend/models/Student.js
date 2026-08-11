const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true, trim: true },
    registerNumber: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, default: "" },

    // Institutional Hierarchy References
    college: { type: mongoose.Schema.Types.ObjectId, ref: "College" },
    departmentRef: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    courseRef: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    batchRef: { type: mongoose.Schema.Types.ObjectId, ref: "Batch" },

    // Text Fallbacks for Search & Filtering
    department: { type: String, required: true },
    degree: { type: String, default: "B.E Computer Science and Engineering" },
    institution: { type: String, default: "ABC Engineering College" },
    university: { type: String, default: "XYZ University" },
    batch: { type: String, required: true },
    graduationYear: { type: Number, default: 2027 },
    walletAddress: { type: String, default: "" },

    // Academic Record Verification Metadata
    academicRecordId: { type: String, sparse: true, trim: true }, // e.g. BCERT-2026-000001
    merkleRoot: { type: String, default: "" },
    qrCodeUrl: { type: String, default: "" },
    blockchainStatus: {
      type: String,
      enum: ["UNANCHORED", "PENDING", "VERIFIED"],
      default: "UNANCHORED",
    },
    transactionHash: { type: String, default: "" },
    blockNumber: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", StudentSchema);
