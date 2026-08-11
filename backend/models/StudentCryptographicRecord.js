const mongoose = require("mongoose");

const StudentCryptographicRecordSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      unique: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
      index: true,
    },
    documentHashes: [
      {
        type: String,
        trim: true,
      },
    ],
    studentRecordHash: {
      type: String,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudentCryptographicRecord", StudentCryptographicRecordSchema);
