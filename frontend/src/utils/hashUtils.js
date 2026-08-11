/**
 * Generate canonical SHA-256 hash in browser using Web Crypto API
 */
export async function calculateCanonicalHash(data) {
  const canonicalData = {
    certificateId: String(data.certificateId || "").trim(),
    completionDate: String(data.completionDate || "").trim(),
    courseId: String(data.courseId || "").trim(),
    grade: String(data.grade || "").trim(),
    institutionId: String(data.institutionId || "ABC Institute of Technology").trim(),
    studentId: String(data.studentId || "").trim(),
  };

  const jsonString = JSON.stringify(canonicalData, Object.keys(canonicalData).sort());
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(jsonString);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return "0x" + hashHex;
}

export function formatAddress(address) {
  if (!address) return "N/A";
  if (address.length <= 10) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

export function formatHash(hash) {
  if (!hash) return "N/A";
  if (hash.length <= 16) return hash;
  return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
}
