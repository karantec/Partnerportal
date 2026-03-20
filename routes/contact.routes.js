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

// ─── Customer + Customer Admin + Super Admin ──────────────
router.post(
  "/",
  protect,
  authorizeRoles(
    "customer",
    "customer_admin",
    "vendor",
    "vendor_admin",
    "super_admin",
  ),
  createContact,
);
router.get(
  "/",
  protect,
  authorizeRoles(
    "customer",
    "customer_admin",
    "vendor",
    "vendor_admin",
    "super_admin",
  ),
  getAllContacts,
);
router.get(
  "/partner/:partnerNo",
  protect,
  authorizeRoles("customer", "vendor"),
  getContactsByPartner,
);
router.get(
  "/:id",
  protect,
  authorizeRoles(
    "customer",
    "customer_admin",
    "vendor",
    "vendor_admin",
    "super_admin",
  ),
  getContactById,
);
router.put(
  "/:id",
  protect,
  authorizeRoles(
    "customer",
    "customer_admin",
    "vendor",
    "vendor_admin",
    "super_admin",
  ),
  updateContact,
);

// ─── Customer Admin + Super Admin Only ────────────────────
router.patch(
  "/:id/sync",
  protect,
  authorizeRoles(
    "customer_admin",
    "vendor",
    "vendor_admin",
    "customer",
    "super_admin",
  ),
  updateSyncStatus,
);
router.patch(
  "/:id/portal",
  protect,
  authorizeRoles(
    "customer_admin",
    "vendor",
    "vendor_admin",
    "customer",
    "super_admin",
  ),
  updatePortalAccess,
);
router.delete(
  "/:id",
  protect,
  authorizeRoles(
    "customer_admin",
    "vendor",
    "vendor_admin",
    "customer",
    "super_admin",
  ),
  deleteContact,
);

module.exports = router;
