const User = require("../models/Authorization.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// ─── Generate Token ───────────────────────────────────────
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "30d" },
  );
};

// ─── Register ─────────────────────────────────────────────
const register = (role) => async (req, res) => {
  try {
    // Check duplicate ref_no
    const refNo = req.body.customerNo || req.body.vendorNo;
    if (refNo) {
      const existing = await User.findByRefNo(refNo);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `${role} reference number already exists`,
        });
      }
    }

    // Check duplicate email
    if (req.body.email) {
      const existingEmail = await User.findByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already registered",
        });
      }
    }

    // Hash password
    if (!req.body.password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = await User.create(
      { ...req.body, password: hashedPassword },
      role,
    );
    const token = generateToken(user);

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      message: `${role} registered successfully`,
      token,
      data: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Login ────────────────────────────────────────────────
const login = (role) => async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user with password
    const user = await User.findByEmailWithPassword(email);
    if (!user || user.role !== role) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user);
    const { password: pwd, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: `${role} logged in successfully`,
      token,
      data: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get All ──────────────────────────────────────────────
const getAll = (role) => async (req, res) => {
  try {
    const users = await User.findAll(role);
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get by ID ────────────────────────────────────────────
const getById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Me ───────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update ───────────────────────────────────────────────
const update = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const updated = await User.update(req.params.id, req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete ───────────────────────────────────────────────
const remove = async (req, res) => {
  try {
    const deleted = await User.delete(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getAll, getById, getMe, update, remove };
