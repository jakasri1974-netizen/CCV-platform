const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getDepartments, createDepartment } = require("../controllers/departmentController");
const { getCourses } = require("../controllers/courseController");

const router = express.Router();

router.get("/", getDepartments);
router.get("/:departmentId/courses", getCourses);
router.post("/", protect, createDepartment);

module.exports = router;
