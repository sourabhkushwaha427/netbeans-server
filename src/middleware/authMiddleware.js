const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

// requireAuth - verifies Bearer JWT only
exports.requireAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing auth token" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// add near exports in src/middleware/authMiddleware.js
exports.requireRoles = (allowed = []) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (!Array.isArray(allowed) || !allowed.length) return next();
    if (!allowed.includes(req.user.role)) return res.status(403).json({ error: "Forbidden" });
    next();
  };
};


exports.requireAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Require ADMIN role" });
  next();
};
