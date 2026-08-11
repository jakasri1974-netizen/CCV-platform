const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema(
  {
    certificateId: { type: String, required: true, unique: true, trim: true, index: true },
    documentId: { type: String, trim: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    studentId: { type: String, required: true, trim: true, index: true },
    college: { type: mongoose.Schema.Types.ObjectId, ref: "College", index: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", index: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", index: true },
    documentType: {
      type: String,
      required: true,
      default: "Semester Marksheet",
    },
    semester: {
      type: String,
      default: "N/A",
    },
    fileName: { type: String, required: true },
    originalFilename: { type: String },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    sha256Hash: { type: String, required: true, index: true },
    documentHash: { type: String }, // Compatible alias
    ipfsCid: { type: String, required: true },
    ipfsUrl: { type: String, default: "" },
    localFilePath: { type: String, default: "" },
    uploadedBy: { type: String, default: "College Administrator" },
    uploadedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["ACTIVE", "REVOKED", "SUPERSEDE"],
      default: "ACTIVE",
    },
    verificationStatus: {
      type: String,
      enum: ["STORED", "VERIFIED", "TAMPERED"],
      default: "STORED",
    },
  },
  { timestamps: true }
);

// Create compound search index on sha256Hash
DocumentSchema.index({ sha256Hash: 1 });
DocumentSchema.index({ certificateId: 1 });

module.exports = mongoose.model("Document", DocumentSchema);
