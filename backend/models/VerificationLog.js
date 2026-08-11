const mongoose = require("mongoose");

const VerificationLogSchema = new mongoose.Schema(
  {
    certificateId: { type: String, required: true },
    verifiedAt: { type: Date, default: Date.now },
    result: {
      type: String,
      enum: ["SUCCESS", "HASH_MISMATCH", "REVOKED", "NOT_FOUND"],
      required: true,
    },
    requesterType: {
      type: String,
      enum: ["employer", "student", "admin", "public"],
      default: "employer",
    },
    ipAddress: { type: String, default: "127.0.0.1" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VerificationLog", VerificationLogSchema);
