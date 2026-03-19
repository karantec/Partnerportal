const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getAll,
  getById,
  getMe,
  update,
  remove,
} = require("../controllers/Customer.controller");
const {
  protect,
  protectRegister,
  authorizeRoles,
} = require("../middleware/auth.middleware");

// ─── register is protected by registerToken ───────────────
router.post("/register", protectRegister, register("vendor"));
router.post("/login", login("vendor"));
router.get("/", protect, authorizeRoles("vendor", "admin"), getAll("vendor"));
router.get("/me", protect, authorizeRoles("vendor"), getMe);
router.get("/:id", protect, authorizeRoles("vendor", "admin"), getById);
router.put("/:id", protect, authorizeRoles("vendor", "admin"), update);
router.delete("/:id", protect, authorizeRoles("admin"), remove);

module.exports = router;
