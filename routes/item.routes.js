const express = require("express");
const router = express.Router();
const {
  createItemRequest,
  getAllItemRequests,
  getItemRequestById,
  getItemsByPartner,
  updateItemRequest,
  updateItemStatus,
  updateItemBlock,
  deleteItemRequest,
} = require("../controllers/Item.Controller");
const { protect, authorizeRoles } = require("../middleware/auth.middleware");

// ─── Vendor + Admin ───────────────────────────────────────
router.post("/", protect, authorizeRoles("vendor", "admin"), createItemRequest);
router.get("/", protect, authorizeRoles("vendor", "admin"), getAllItemRequests);
router.get(
  "/partner/:partnerNo",
  protect,
  authorizeRoles("vendor", "admin"),
  getItemsByPartner,
);
router.get(
  "/:id",
  protect,
  authorizeRoles("vendor", "admin"),
  getItemRequestById,
);
router.put(
  "/:id",
  protect,
  authorizeRoles("vendor", "admin"),
  updateItemRequest,
);

// ─── Admin Only ───────────────────────────────────────────
router.patch("/:id/status", protect, authorizeRoles("admin"), updateItemStatus);
router.patch("/:id/block", protect, authorizeRoles("admin"), updateItemBlock);
router.delete("/:id", protect, authorizeRoles("admin"), deleteItemRequest);

module.exports = router;
