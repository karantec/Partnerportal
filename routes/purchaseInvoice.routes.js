const express = require("express");
const router = express.Router();
const {
  createPurchaseInvoice,
  getAllPurchaseInvoices,
  getPurchaseInvoiceById,
  getPurchaseInvoiceByNo,
  getPurchaseInvoicesByPartner,
  updatePurchaseInvoice,
  updatePurchaseInvoiceStatus,
  deletePurchaseInvoice,
} = require("../controllers/PurchaseInvoice.controller");
const { protect, authorizeRoles } = require("../middleware/auth.middleware");

// ─── Vendor + Vendor Admin + Super Admin ──────────────────
router.post(
  "/",
  protect,
  authorizeRoles("vendor", "vendor_admin", "super_admin"),
  createPurchaseInvoice,
);
router.get(
  "/",
  protect,
  authorizeRoles("vendor", "vendor_admin", "super_admin"),
  getAllPurchaseInvoices,
);
router.get(
  "/partner/:partnerNo",
  protect,
  authorizeRoles("vendor", "vendor_admin", "super_admin"),
  getPurchaseInvoicesByPartner,
);
router.get(
  "/no/:invoiceNo",
  protect,
  authorizeRoles("vendor", "vendor_admin", "super_admin"),
  getPurchaseInvoiceByNo,
);
router.get(
  "/:id",
  protect,
  authorizeRoles("vendor", "vendor_admin", "super_admin"),
  getPurchaseInvoiceById,
);
router.put(
  "/:id",
  protect,
  authorizeRoles("vendor", "vendor_admin", "super_admin"),
  updatePurchaseInvoice,
);

// ─── Vendor Admin + Super Admin Only ─────────────────────
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("vendor_admin", "super_admin"),
  updatePurchaseInvoiceStatus,
);
router.delete(
  "/:id",
  protect,
  authorizeRoles("vendor_admin", "super_admin"),
  deletePurchaseInvoice,
);

module.exports = router;
