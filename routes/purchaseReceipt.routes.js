const express = require("express");
const router = express.Router();
const {
  createPurchaseReceipt,
  getAllPurchaseReceipts,
  getPurchaseReceiptById,
  getPurchaseReceiptByShipmentNo,
  getPurchaseReceiptsByPartner,
  updatePurchaseReceipt,
  updatePurchaseReceiptStatus,
  deletePurchaseReceipt,
} = require("../controllers/PurchaseReceipt.controller");
const { protect, authorizeRoles } = require("../middleware/auth.middleware");

// ─── Vendor + Vendor Admin + Super Admin ──────────────────
router.post(
  "/",
  protect,
  authorizeRoles("vendor", "vendor_admin", "super_admin"),
  createPurchaseReceipt,
);
router.get(
  "/",
  protect,
  authorizeRoles("vendor", "vendor_admin", "super_admin"),
  getAllPurchaseReceipts,
);
router.get(
  "/partner/:partnerNo",
  protect,
  authorizeRoles("vendor", "vendor_admin", "super_admin"),
  getPurchaseReceiptsByPartner,
);
router.get(
  "/shipment/:shipmentNo",
  protect,
  authorizeRoles("vendor", "vendor_admin", "super_admin"),
  getPurchaseReceiptByShipmentNo,
);
router.get(
  "/:id",
  protect,
  authorizeRoles("vendor", "vendor_admin", "super_admin"),
  getPurchaseReceiptById,
);
router.put(
  "/:id",
  protect,
  authorizeRoles("vendor", "vendor_admin", "super_admin"),
  updatePurchaseReceipt,
);

// ─── Vendor Admin + Super Admin Only ─────────────────────
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("vendor_admin", "super_admin"),
  updatePurchaseReceiptStatus,
);
router.delete(
  "/:id",
  protect,
  authorizeRoles("vendor_admin", "super_admin"),
  deletePurchaseReceipt,
);

module.exports = router;
