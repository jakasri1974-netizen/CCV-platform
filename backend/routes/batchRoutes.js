const express = require("express");
const router = express.Router();
const {
  getBatches,
  getBatchById,
  createBatch,
  generateBatchMerkleRoot,
  anchorBatchOnPolygon,
} = require("../controllers/batchController");
const { getStudents } = require("../controllers/studentController");
const { protect } = require("../middleware/authMiddleware");

router.get("/:batchId/students", getStudents);

router.use(protect);

router.route("/").get(getBatches).post(createBatch);

router.get("/:batchId", getBatchById);
router.post("/:batchId/generate-root", generateBatchMerkleRoot);
router.post("/:batchId/generate-merkle", generateBatchMerkleRoot);
router.post("/:batchId/anchor", anchorBatchOnPolygon);

module.exports = router;
