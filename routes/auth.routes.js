const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); // built-in node module, no install needed

// Store current secret key and expiry in memory
let currentSecretKey = null;
let secretKeyExpiry = null;

// POST /api/auth/get-register-token
router.post("/get-register-token", (req, res) => {
  try {
    // ─── Step 1: Generate new secret key on every call ────
    currentSecretKey = crypto.randomBytes(32).toString("hex");
    secretKeyExpiry = Date.now() + 15 * 60 * 1000; // 15 min expiry

    console.log("🔑 New Secret Key Generated:", currentSecretKey);
    console.log(
      "⏰ Expires at:",
      new Date(secretKeyExpiry).toLocaleTimeString(),
    );

    // ─── Step 2: Generate register token using new key ────
    const registerToken = jwt.sign(
      {
        purpose: "registration",
        secretKey: currentSecretKey, // embed key inside token
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    res.status(200).json({
      success: true,
      message:
        "New secret key and register token generated. Valid for 15 minutes.",
      secretKey: currentSecretKey, // send to client
      registerToken, // send to client
      expiresAt: new Date(secretKeyExpiry),
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
