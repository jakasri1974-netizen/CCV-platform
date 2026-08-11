const express = require("express");
const multer = require("multer");
const { protect } = require("../middleware/authMiddleware");
const {
  uploadDocument,
  getStudentDocuments,
  serveIpfsFile,
} = require("../controllers/documentController");
const { verifyByUploadedPdf } = require("../controllers/verifyController");

const router = express.Router();

// Memory storage for calculating SHA-256 buffer hashes & IPFS uploading
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max file size
});

// Admin-only document upload
router.post("/upload", protect, upload.single("file"), uploadDocument);

// Get student documents
router.get("/student/:studentId", protect, getStudentDocuments);

// Public / Employer test file integrity check
router.post("/verify-file", upload.single("file"), verifyByUploadedPdf);

// IPFS Local Gateway viewer
router.get("/ipfs/:cid", serveIpfsFile);

module.exports = router;
