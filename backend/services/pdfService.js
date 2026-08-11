const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { generateQRCodeDataURI } = require("./qrService");

/**
 * Generate PDF Certificate and store off-chain in uploads directory
 * @param {Object} certificateData
 * @returns {Promise<string>} Relative file path to generated PDF
 */
async function generateCertificatePDF(certificateData) {
  const uploadsDir = path.join(__dirname, "../uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filename = `cert_${certificateData.certificateId.replace(/[^a-zA-Z0-9-]/g, "_")}.pdf`;
  const filePath = path.join(uploadsDir, filename);

  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        layout: "landscape",
        size: "A4",
        margin: 40,
      });

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // Certificate Outer Border
      doc
        .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
        .strokeColor("#4f46e5")
        .lineWidth(4)
        .stroke();

      doc
        .rect(26, 26, doc.page.width - 52, doc.page.height - 52)
        .strokeColor("#818cf8")
        .lineWidth(1)
        .stroke();

      // Header Banner
      doc
        .fillColor("#1e1b4b")
        .fontSize(24)
        .font("Helvetica-Bold")
        .text(certificateData.institutionName || "ABC INSTITUTE OF TECHNOLOGY", {
          align: "center",
        });

      doc.moveDown(0.3);
      doc
        .fillColor("#6366f1")
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("OFFICIAL BLOCKCHAIN-ANCHORED CREDENTIAL", { align: "center" });

      doc.moveDown(1);
      doc
        .fillColor("#475569")
        .fontSize(13)
        .font("Helvetica")
        .text("This is to certify that", { align: "center" });

      // Student Name
      doc.moveDown(0.5);
      doc
        .fillColor("#0f172a")
        .fontSize(28)
        .font("Helvetica-Bold")
        .text(certificateData.studentName || "STUDENT NAME", { align: "center" });

      doc.moveDown(0.5);
      doc
        .fillColor("#475569")
        .fontSize(13)
        .font("Helvetica")
        .text("has successfully completed all requirements for the course", {
          align: "center",
        });

      // Course Name
      doc.moveDown(0.5);
      doc
        .fillColor("#4338ca")
        .fontSize(22)
        .font("Helvetica-Bold")
        .text(certificateData.courseName || "COURSE TITLE", { align: "center" });

      // Grade & Completion Date
      doc.moveDown(0.8);
      doc
        .fillColor("#334155")
        .fontSize(12)
        .font("Helvetica")
        .text(
          `Grade: ${certificateData.grade || "A+"}   |   Completion Date: ${certificateData.completionDate}`,
          { align: "center" }
        );

      // Footer Section: Blockchain Info & QR Code
      const qrDataUri = await generateQRCodeDataURI(certificateData.certificateId);
      const qrBase64 = qrDataUri.replace(/^data:image\/png;base64,/, "");
      const qrBuffer = Buffer.from(qrBase64, "base64");

      const yPosition = doc.page.height - 150;
      doc.image(qrBuffer, 60, yPosition, { width: 90, height: 90 });

      doc
        .fillColor("#64748b")
        .fontSize(8)
        .font("Helvetica-Bold")
        .text("SCAN QR CODE TO VERIFY ON-CHAIN", 60, yPosition + 95);

      // Metadata box on the right
      doc
        .fillColor("#0f172a")
        .fontSize(10)
        .font("Helvetica-Bold")
        .text(`Certificate ID: ${certificateData.certificateId}`, 200, yPosition + 10);

      doc
        .fillColor("#475569")
        .fontSize(8)
        .font("Helvetica")
        .text(`SHA-256 Hash: ${certificateData.certificateHash}`, 200, yPosition + 28, {
          width: 500,
        });

      doc
        .fillColor("#475569")
        .fontSize(8)
        .font("Helvetica")
        .text(
          `Blockchain: Polygon | Tx: ${certificateData.transactionHash || "Pending Confirmation"}`,
          200,
          yPosition + 45,
          { width: 500 }
        );

      doc
        .fillColor("#16a34a")
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("Status: BLOCKCHAIN VERIFIED", 200, yPosition + 65);

      doc.end();

      writeStream.on("finish", () => {
        resolve(`/uploads/${filename}`);
      });

      writeStream.on("error", (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generateCertificatePDF,
};
