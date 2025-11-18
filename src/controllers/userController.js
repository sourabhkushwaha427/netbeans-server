const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const ALLOWED_ROLES = ["ADMIN", "JOB_MANAGER"];

exports.adminCreateUser = async (req, res) => {
  try {
    const admin = req.user;
    if (!admin) return res.status(401).json({ error: "Unauthorized" });
    const { full_name, email, password, role } = req.body;
    if (!full_name || !email || !password) {
      return res.status(400).json({ error: "full_name, email and password are required" });
    }
    const normalizedRole = role ? role.toUpperCase() : "JOB_MANAGER";
    if (!ALLOWED_ROLES.includes(normalizedRole)) {
      return res.status(400).json({ error: `role must be one of: ${ALLOWED_ROLES.join(", ")}` });
    }
    const existing = await User.getUserByEmail(email);
    if (existing) return res.status(409).json({ error: "Email already registered" });
    const password_hash = await bcrypt.hash(password, 10);
    const createdUser = await User.createUser({ full_name, email, password_hash, role: normalizedRole, created_by_admin_id: admin.id || null });
    return res.status(201).json({ user: createdUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.getUserById(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: "role is required" });

    const newRole = role.toUpperCase();
    if (!ALLOWED_ROLES.includes(newRole)) {
      return res.status(400).json({ error: `role must be one of: ${ALLOWED_ROLES.join(", ")}` });
    }
    const updated = await User.updateUserRole(id, newRole);
    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const target = await User.getUserById(id);
    if (!target) return res.status(404).json({ error: "User not found" });
    if (target.role === "SUPERADMIN") {
      return res.status(403).json({ error: "Cannot delete SUPERADMIN" });
    }
    await User.deleteUser(id);
    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

