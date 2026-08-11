const express = require("express");
const router = express.Router();
const {
  getStudents,
  getStudentById,
  createStudent,
  importStudentsCsv,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/import", importStudentsCsv);

router
  .route("/")
  .get(getStudents)
  .post(createStudent);

router
  .route("/:id")
  .get(getStudentById)
  .put(updateStudent)
  .delete(deleteStudent);

module.exports = router;
