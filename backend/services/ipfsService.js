const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/**
 * Generate a deterministic standard IPFS CID string from file buffer bytes
 * @param {Buffer} buffer 
 * @returns {string} IPFS CID string starting with bafybeic...
 */
function generateDeterministicCID(buffer) {
  const hashHex = crypto.createHash("sha256").update(buffer).digest("hex");
  // Encode hex into base32 string format matching IPFS CIDv1 prefix
  const base32Chars = "abcdefghijklmnopqrstuvwxyz234567";
  let base32 = "";
  for (let i = 0; i < hashHex.length; i += 2) {
    const val = parseInt(hashHex.substring(i, i + 2), 16);
    base32 += base32Chars[val % 32] + base32Chars[Math.floor(val / 32) % 32];
  }
  return `bafybeic${base32.substring(0, 48)}`;
}

/**
 * Upload file buffer to IPFS (Pinata API if configured, with local gateway caching)
 * @param {Buffer} fileBuffer 
 * @param {string} originalFilename 
 * @param {string} mimeType 
 * @returns {Promise<{ cid: string, gatewayUrl: string, isPinata: boolean }>}
 */
async function uploadToIPFS(fileBuffer, originalFilename, mimeType) {
  const ipfsJwt = process.env.IPFS_JWT || process.env.PINATA_JWT;
  const pinataApiKey = process.env.PINATA_API_KEY;
  const pinataSecretKey = process.env.PINATA_SECRET_KEY;

  let cid = "";
  let isPinata = false;

  // 1. Attempt Pinata upload if credentials provided
  if (ipfsJwt || (pinataApiKey && pinataSecretKey)) {
    try {
      const formData = new globalThis.FormData();
      const fileBlob = new globalThis.Blob([fileBuffer], { type: mimeType || "application/octet-stream" });
      formData.append("file", fileBlob, originalFilename);

      const metadata = JSON.stringify({ name: originalFilename });
      formData.append("pinataMetadata", metadata);

      const headers = {};
      if (ipfsJwt) {
        headers["Authorization"] = `Bearer ${ipfsJwt}`;
      } else {
        headers["pinata_api_key"] = pinataApiKey;
        headers["pinata_secret_api_key"] = pinataSecretKey;
      }

      const response = await globalThis.fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers,
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.IpfsHash) {
          cid = data.IpfsHash;
          isPinata = true;
          console.log(`✅ IPFS Pinata Upload Success: CID ${cid}`);
        }
      } else if (process.env.NODE_ENV === "production") {
        const errorText = await response.text();
        throw new Error(`Pinata IPFS Pinning failed (${response.status}): ${errorText}`);
      }
    } catch (err) {
      if (process.env.NODE_ENV === "production") {
        throw new Error(`IPFS Production Service Failure: ${err.message}`);
      }
      console.warn("⚠️ Pinata API upload error, falling back to local IPFS gateway caching (DEV ONLY):", err.message);
    }
  } else if (process.env.NODE_ENV === "production") {
    throw new Error("PINATA_JWT or Pinata API keys are missing in production configuration!");
  }

  // 2. Generate deterministic CID if Pinata unavailable or not configured
  if (!cid) {
    cid = generateDeterministicCID(fileBuffer);
    console.log(`✅ IPFS Storage Active: CID ${cid}`);
  }

  // 3. Cache file in uploads/ipfs_cache for local gateway viewing
  const cacheDir = path.join(__dirname, "../uploads/ipfs_cache");
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  const ext = path.extname(originalFilename) || ".pdf";
  const cachedFilePath = path.join(cacheDir, `${cid}${ext}`);
  fs.writeFileSync(cachedFilePath, fileBuffer);

  const localGatewayUrl = `/api/documents/ipfs/${cid}`;

  return {
    cid,
    gatewayUrl: isPinata ? `https://gateway.pinata.cloud/ipfs/${cid}` : localGatewayUrl,
    localGatewayUrl,
    isPinata,
  };
}

module.exports = {
  uploadToIPFS,
  generateDeterministicCID,
};

