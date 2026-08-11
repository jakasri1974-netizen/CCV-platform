const QRCode = require("qrcode");

/**
 * Generate QR code Data URI embedding the verification URL
 * @param {string} certificateId
 * @returns {Promise<string>} Base64 Data URL
 */
async function generateQRCodeDataURI(certificateId) {
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const verifyUrl = `${baseUrl}/verify/${certificateId}`;
  
  try {
    const dataUri = await QRCode.toDataURL(verifyUrl, {
      errorCorrectionLevel: "H",
      type: "image/png",
      quality: 0.92,
      margin: 1,
      color: {
        dark: "#1e1b4b", // Deep indigo
        light: "#ffffff",
      },
    });
    return dataUri;
  } catch (err) {
    console.error("QR Generation error:", err);
    throw err;
  }
}

module.exports = {
  generateQRCodeDataURI,
};
