const express = require("express");
const router = express.Router();
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController");
const { getBatches } = require("../controllers/batchController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.get("/:courseId/batches", getBatches);
router.get("/", getCourses);

router.use(protect);

router.post("/", authorize("admin", "super_admin"), createCourse);

router
  .route("/:id")
  .get(getCourseById)
  .put(authorize("admin", "super_admin"), updateCourse)
  .delete(authorize("admin", "super_admin"), deleteCourse);

module.exports = router;
