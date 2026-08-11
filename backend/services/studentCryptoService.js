const crypto = require("crypto");
const Document = require("../models/Document");
const StudentCryptographicRecord = require("../models/StudentCryptographicRecord");

/**
 * Re-calculates and persists studentRecordHash for a student in MongoDB
 */
const updateStudentCryptoRecord = async (studentId, batchId) => {
  try {
    const docs = await Document.find({ student: studentId, status: "ACTIVE" });
    const documentHashes = docs
      .map((d) => d.sha256Hash || d.documentHash)
      .filter(Boolean)
      .sort(); // Deterministic sorting

    let studentRecordHash = "";
    if (documentHashes.length === 0) {
      studentRecordHash = crypto.createHash("sha256").update(`NO_DOCS_${studentId}`).digest("hex");
    } else {
      studentRecordHash = crypto.createHash("sha256").update(documentHashes.join("")).digest("hex");
    }

    const record = await StudentCryptographicRecord.findOneAndUpdate(
      { studentId },
      {
        studentId,
        batchId,
        documentHashes,
        studentRecordHash,
      },
      { upsert: true, new: true }
    );

    return record;
  } catch (err) {
    console.error(`Error updating student crypto record for student ${studentId}:`, err);
    throw err;
  }
};

module.exports = {
  updateStudentCryptoRecord,
};
