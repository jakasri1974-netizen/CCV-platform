const mongoose = require("mongoose");

const CertificateSchema = new mongoose.Schema(
  {
    certificateId: { type: String, required: true, unique: true, trim: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    grade: { type: String, required: true },
    completionDate: { type: String, required: true },
    institutionId: { type: String, default: "ABC Institute of Technology" },
    certificateType: { type: String, default: "Certificate of Completion" },
    
    // Cryptographic Hashes & Off-chain files
    certificateHash: { type: String, required: true }, // SHA-256 hex string starting with 0x
    pdfUrl: { type: String, default: "" },
    qrVerificationUrl: { type: String, default: "" },

    // Merkle Tree Batch Attributes
    batchId: { type: String, default: "BATCH-2026-CSE-A" },
    merkleRoot: { type: String, default: "" },
    merkleProof: [
      {
        position: { type: String, enum: ["left", "right"] },
        data: { type: String },
      },
    ],
    
    // Blockchain On-Chain Transaction Metadata
    transactionHash: { type: String, default: "" },
    blockNumber: { type: Number, default: 0 },
    issuerAddress: { type: String, default: "" },
    issuedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["VERIFIED", "REVOKED", "PENDING"],
      default: "VERIFIED",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Certificate", CertificateSchema);
