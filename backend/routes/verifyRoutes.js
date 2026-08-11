const express = require("express");
const router = express.Router();
const multer = require("multer");
const { verifyByCertificateId, verifyByUploadedPdf } = require("../controllers/verifyController");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
});

// Method 1: Public verification by Certificate ID - NO auth required
router.get("/:certificateId", verifyByCertificateId);

// Method 2: Public verification by PDF File Upload - NO auth required
router.post("/upload", upload.single("file"), verifyByUploadedPdf);

module.exports = router;
