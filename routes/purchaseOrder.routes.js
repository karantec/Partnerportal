const express = require("express");
const router = express.Router();
const {
  createPurchaseOrder,
  getAllPurchaseOrders,
  getPurchaseOrderById,
  getOrdersByPartner,
  updatePurchaseOrder,
  updateOrderStatus,
  deletePurchaseOrder,
} = require("../controllers/PurchaseOrder.controller");
const { protect, authorizeRoles, protectRegister } = require("../middleware/auth.middleware");

// ─── Vendor + Vendor Admin + Super Admin ──────────────────
router.post(
  "/",
  protect,
  authorizeRoles("vendor", "vendor_admin", "super_admin"),
  createPurchaseOrder,
);

router.post(
  "/",
  protectRegister,
  createPurchaseOrder,
);
router.get(
  "/",
  protect,
  authorizeRoles("vendor", "vendor_admin", "super_admin"),
  getAllPurchaseOrders,
);
router.get(
  "/partner/:partnerNo",
  protect,
  authorizeRoles("vendor", "vendor_admin", "super_admin"),
  getOrdersByPartner,
);
router.get(
  "/:id",
  protect,
  authorizeRoles("vendor", "vendor_admin", "super_admin"),
  getPurchaseOrderById,
);
router.put(
  "/:id",
  protect,
  authorizeRoles("vendor", "vendor_admin", "super_admin"),
  updatePurchaseOrder,
);

// ─── Vendor Admin + Super Admin Only ─────────────────────
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("vendor_admin", "super_admin"),
  updateOrderStatus,
);
router.delete(
  "/:id",
  protect,
  authorizeRoles("vendor_admin", "super_admin"),
  deletePurchaseOrder,
);

module.exports = router;
