const crypto = require("crypto");

/**
 * Generate a deterministic SHA-256 cryptographic hash from canonical certificate data.
 * @param {Object} data
 * @param {string} data.certificateId
 * @param {string} data.studentId
 * @param {string} data.courseId
 * @param {string} data.grade
 * @param {string} data.completionDate
 * @param {string} data.institutionId
 * @returns {string} Bytes32 hex string starting with '0x'
 */
function generateCertificateHash(data) {
  const canonicalData = {
    certificateId: String(data.certificateId || "").trim(),
    completionDate: String(data.completionDate || "").trim(),
    courseId: String(data.courseId || "").trim(),
    grade: String(data.grade || "").trim(),
    institutionId: String(data.institutionId || "ABC Institute of Technology").trim(),
    studentId: String(data.studentId || "").trim(),
  };

  // Alphabetically sorted keys JSON representation ensures 100% deterministic output
  const jsonString = JSON.stringify(canonicalData, Object.keys(canonicalData).sort());
  const hashHex = crypto.createHash("sha256").update(jsonString).digest("hex");
  return "0x" + hashHex;
}

module.exports = {
  generateCertificateHash,
};
