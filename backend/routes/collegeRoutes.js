const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getColleges,
  getCollegeById,
  createCollege,
  createCollegeAdmin,
} = require("../controllers/collegeController");
const { getDepartments } = require("../controllers/departmentController");

const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", getColleges);
router.get("/:id", getCollegeById);
router.get("/:collegeId/departments", getDepartments);
router.post("/", protect, authorize("super_admin", "admin"), createCollege);
router.post("/:id/admin", protect, authorize("super_admin", "admin"), createCollegeAdmin);

module.exports = router;
