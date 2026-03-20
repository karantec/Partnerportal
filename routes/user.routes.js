const express = require("express");
const router = express.Router();
const {
  register,
  getAll,
  getById,
  getMe,
  update,
  remove,
} = require("../controllers/Customer.controller");
const {
  protect,
  protectRegister,
  isSuperAdmin,
  authorizeRoles,
} = require("../middleware/auth.middleware");

// ─── 1. Register (customer | vendor | customer_admin | vendor_admin) ──
// POST /api/users/register
// Requires x-register-token in header
router.post("/register", protectRegister, register);

// ─── 2. Get All Users ──────────────────────────────────────
// GET /api/users
// super_admin    → all users
// customer_admin → all customers + customer_admins
// vendor_admin   → all vendors + vendor_admins
// customer       → own role only
// vendor         → own role only
router.get("/", protect, getAll);

// ─── 3. Get My Profile ────────────────────────────────────
// GET /api/users/me
router.get("/me", protect, getMe);

// ─── 4. Get User by ID ────────────────────────────────────
// GET /api/users/:id
router.get("/:id", protect, getById);

// ─── 5. Update User ───────────────────────────────────────
// PUT /api/users/:id
// super_admin/customer_admin/vendor_admin → any user
// customer/vendor → own profile only
router.put("/:id", protect, update);

// ─── 6. Delete User ───────────────────────────────────────
// DELETE /api/users/:id
// super_admin only
router.delete("/:id", protect, isSuperAdmin, remove);

module.exports = router;
