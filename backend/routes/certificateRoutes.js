const express = require("express");
const router = express.Router();
const {
  prepareIssuance,
  confirmIssuance,
  getCertificates,
  getCertificateById,
  revokeCertificate,
} = require("../controllers/certificateController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.use(protect);

router.get("/", getCertificates);
router.get("/:id", getCertificateById);

router.post("/prepare", authorize("admin", "college_admin", "super_admin"), prepareIssuance);
router.post("/confirm", authorize("admin", "college_admin", "super_admin"), confirmIssuance);
router.post("/:id/revoke", authorize("admin", "college_admin", "super_admin"), revokeCertificate);

module.exports = router;
