const express = require("express");
const router = express.Router();
const {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  getInvoiceByNo,
  getInvoicesByPartner,
  updateInvoice,
  updateInvoiceStatus,
  deleteInvoice,
} = require("../controllers/Invoice.controller");
const { protect, authorizeRoles, protectRegister } = require("../middleware/auth.middleware");

// ─── Vendor + Vendor Admin + Customer + Customer Admin + Super Admin ──
router.post(
  "/",
  protect,
  authorizeRoles(
    "vendor",
    "vendor_admin",
    "customer",
    "customer_admin",
    "super_admin",
  ),
  createInvoice,
);
router.post(
  "/",
  protectRegister,
  createInvoice,
);
router.get(
  "/",
  protect,
  authorizeRoles(
    "vendor",
    "vendor_admin",
    "customer",
    "customer_admin",
    "super_admin",
  ),
  getAllInvoices,
);
router.get(
  "/partner/:partnerNo",
  protect,
  authorizeRoles(
    "vendor",
    "vendor_admin",
    "customer",
    "customer_admin",
    "super_admin",
  ),
  getInvoicesByPartner,
);
router.get(
  "/no/:invoiceNo",
  protect,
  authorizeRoles(
    "vendor",
    "vendor_admin",
    "customer",
    "customer_admin",
    "super_admin",
  ),
  getInvoiceByNo,
);
router.get(
  "/:id",
  protect,
  authorizeRoles(
    "vendor",
    "vendor_admin",
    "customer",
    "customer_admin",
    "super_admin",
  ),
  getInvoiceById,
);
router.put(
  "/:id",
  protect,
  authorizeRoles(
    "vendor",
    "vendor_admin",
    "customer",
    "customer_admin",
    "super_admin",
  ),
  updateInvoice,
);

// ─── Admin Only ───────────────────────────────────────────
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("vendor_admin", "customer_admin", "super_admin"),
  updateInvoiceStatus,
);
router.delete(
  "/:id",
  protect,
  authorizeRoles("vendor_admin", "customer_admin", "super_admin"),
  deleteInvoice,
);

module.exports = router;
