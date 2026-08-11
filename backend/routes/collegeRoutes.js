const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getColleges,
  getCollegeById,
  createCollege,
  createCollegeAdmin,
} = require("../controllers/collegeController");
const { getDepartments } = require("../controllers/departmentController");

const router = express.Router();

router.get("/", getColleges);
router.get("/:id", getCollegeById);
router.get("/:collegeId/departments", getDepartments);
router.post("/", protect, createCollege);
router.post("/:id/admin", protect, createCollegeAdmin);

module.exports = router;
