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
router.post("/register", protectRegister, register("customer"));
router.post("/login", login("customer"));
router.get(
  "/",
  protect,
  authorizeRoles("customer", "admin"),
  getAll("customer"),
);
router.get("/me", protect, authorizeRoles("customer"), getMe);
router.get("/:id", protect, authorizeRoles("customer", "admin"), getById);
router.put("/:id", protect, authorizeRoles("customer", "admin"), update);
router.delete("/:id", protect, authorizeRoles("admin"), remove);

module.exports = router;
