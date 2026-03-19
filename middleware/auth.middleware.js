const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    });
  }
};

// ─── Protect Registration ──────────────────────────────────
const protectRegister = (req, res, next) => {
  try {
    let token;

    if (req.headers["x-register-token"]) {
      token = req.headers["x-register-token"];
    } else if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Registration token required. Call /api/auth/get-register-token first",
      });
    }

    // ─── Verify token ──────────────────────────────────────
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ─── Check purpose ─────────────────────────────────────
    if (decoded.purpose !== "registration") {
      return res.status(403).json({
        success: false,
        message: "Invalid token purpose",
      });
    }

    // ─── Check secret key inside token is still valid ──────
    const {
      getCurrentSecretKey,
      getSecretKeyExpiry,
    } = require("../routes/auth.routes");
    const currentKey = getCurrentSecretKey();
    const expiry = getSecretKeyExpiry();

    if (!currentKey) {
      return res.status(401).json({
        success: false,
        message:
          "No active secret key. Call /api/auth/get-register-token first",
      });
    }

    // ─── Check if secret key has expired ───────────────────
    if (Date.now() > expiry) {
      return res.status(401).json({
        success: false,
        message:
          "Secret key expired. Call /api/auth/get-register-token for a new one",
      });
    }

    // ─── Match secret key inside token vs current key ──────
    if (decoded.secretKey !== currentKey) {
      return res.status(401).json({
        success: false,
        message:
          "Secret key mismatch. Call /api/auth/get-register-token for a new one",
      });
    }

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message:
          "Registration token expired. Call /api/auth/get-register-token for a new one",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid registration token",
    });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Allowed roles: ${roles.join(", ")}`,
      });
    }
    next();
  };
};

module.exports = { protect, protectRegister, authorizeRoles };
