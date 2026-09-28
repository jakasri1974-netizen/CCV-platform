const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controllers/statsController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.get("/stats", protect, authorize("admin", "college_admin", "super_admin"), getDashboardStats);

module.exports = router;
