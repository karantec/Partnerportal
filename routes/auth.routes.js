const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");
const { login } = require("../controllers/Customer.controller");

let currentSecretKey = null;
let secretKeyExpiry = null;

// ─── Get Register Token ────────────────────────────────────
router.post("/get-register-token", (req, res) => {
  try {
    currentSecretKey = crypto.randomBytes(32).toString("hex");
    secretKeyExpiry = Date.now() + 15 * 60 * 1000;

    const registerToken = jwt.sign(
      { purpose: "registration", secretKey: currentSecretKey },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    res.status(200).json({
      success: true,
      message: "Register token generated. Valid for 15 minutes.",
      registerToken,
      expiresAt: new Date(secretKeyExpiry),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Single Login ──────────────────────────────────────────
router.post("/login", login);

// ─── Create Super Admin (one time setup) ──────────────────
router.post("/create-super-admin", async (req, res) => {
  try {
    const { name, email, password, superAdminSecret } = req.body;

    if (superAdminSecret !== process.env.SUPER_ADMIN_SECRET_KEY) {
      return res.status(401).json({
        success: false,
        message: "Invalid super admin secret key",
      });
    }

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    // Check if super admin already exists
    const existing = await pool.query(
      "SELECT * FROM users WHERE role = 'super_admin'",
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Super admin already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, 'super_admin') RETURNING *`,
      [name, email, hashedPassword],
    );

    const { password: pwd, ...superAdminWithoutPassword } = result.rows[0];

    res.status(201).json({
      success: true,
      message: "Super admin created successfully",
      data: superAdminWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = {
  router,
  getCurrentSecretKey: () => currentSecretKey,
  getSecretKeyExpiry: () => secretKeyExpiry,
};
