const express = require("express");
const router = express.Router();
const {
  createContact,
  getAllContacts,
  getContactById,
  getContactsByPartner,
  updateContact,
  updateSyncStatus,
  updatePortalAccess,
  deleteContact,
} = require("../controllers/ContactController");
const { protect, authorizeRoles } = require("../middleware/auth.middleware");

// ─── Customer + Vendor + Admin ────────────────────────────
router.post(
  "/",
  protect,
  authorizeRoles("customer", "vendor", "admin"),
  createContact,
);
router.get(
  "/",
  protect,
  authorizeRoles("customer", "vendor", "admin"),
  getAllContacts,
);
router.get(
  "/partner/:partnerNo",
  protect,
  authorizeRoles("customer", "vendor", "admin"),
  getContactsByPartner,
);
router.get(
  "/:id",
  protect,
  authorizeRoles("customer", "vendor", "admin"),
  getContactById,
);
router.put(
  "/:id",
  protect,
  authorizeRoles("customer", "vendor", "admin"),
  updateContact,
);

// ─── Admin Only ───────────────────────────────────────────
router.patch("/:id/sync", protect, authorizeRoles("admin"), updateSyncStatus);
router.patch(
  "/:id/portal",
  protect,
  authorizeRoles("admin"),
  updatePortalAccess,
);
router.delete("/:id", protect, authorizeRoles("admin"), deleteContact);

module.exports = router;
