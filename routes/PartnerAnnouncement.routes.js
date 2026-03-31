// routes/partnerAnnouncementRoutes.js

const express = require("express");
const router = express.Router();

const {
  createPartnerAnnouncement,
  getAllPartnerAnnouncements,
  getActivePartnerAnnouncements,
  getPartnerAnnouncementById,
  getAnnouncementsByPartnerType,
  updatePartnerAnnouncement,
  updateAnnouncementStatus,
  deletePartnerAnnouncement,
} = require("../controllers/partnerAnnouncementController");

const {
  validateCreate,
  validateUpdate,
} = require("../middleware/auth.middleware");


router.get("/active", getActivePartnerAnnouncements);

router.get("/partner-type/:targetPartnerType", getAnnouncementsByPartnerType);

router.post("/", validateCreate, createPartnerAnnouncement);

router.get("/get", getAllPartnerAnnouncements);

router.get("/:id", getPartnerAnnouncementById);

router.put("/:id", validateUpdate, updatePartnerAnnouncement);

router.patch("/:id/status", updateAnnouncementStatus);

router.delete("/:id", deletePartnerAnnouncement);

module.exports = router;