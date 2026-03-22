const express = require("express");
const router = express.Router();
const {
  createSalesOrder,
  getAllSalesOrders,
  getSalesOrderById,
  getOrdersByPartner,
  updateSalesOrder,
  updateSalesOrderStatus,
  deleteSalesOrder,
} = require("../controllers/SalesOrder.controller");
const { protect, authorizeRoles, protectRegister } = require("../middleware/auth.middleware");

// ─── Customer + Customer Admin + Super Admin ──────────────
router.post(
  "/",
  protect,
  authorizeRoles("customer", "customer_admin", "super_admin"),
  createSalesOrder,
);
router.post(
  "/",
  protectRegister,
  createSalesOrder,
);
router.get(
  "/",
  protect,
  authorizeRoles("customer", "customer_admin", "super_admin"),
  getAllSalesOrders,
);
router.get(
  "/partner/:partnerNo",
  protect,
  authorizeRoles("customer", "customer_admin", "super_admin"),
  getOrdersByPartner,
);
router.get(
  "/:id",
  protect,
  authorizeRoles("customer", "customer_admin", "super_admin"),
  getSalesOrderById,
);
router.put(
  "/:id",
  protect,
  authorizeRoles("customer", "customer_admin", "super_admin"),
  updateSalesOrder,
);

// ─── Customer Admin + Super Admin Only ────────────────────
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("customer_admin", "super_admin"),
  updateSalesOrderStatus,
);
router.delete(
  "/:id",
  protect,
  authorizeRoles("customer_admin", "super_admin"),
  deleteSalesOrder,
);

module.exports = router;
