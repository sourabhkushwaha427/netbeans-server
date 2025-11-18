// src/scripts/createSuperAdmin.js
require("dotenv").config();
const bcrypt = require("bcrypt");
const pool = require("../config/db");

async function createSuperAdmin() {
  try {
    const full_name = process.env.INIT_SUPERADMIN_NAME || "Super Admin";
    const email = process.env.INIT_SUPERADMIN_EMAIL || "superadmin@example.com";
    const password = process.env.INIT_SUPERADMIN_PASSWORD || "ChangeMe@123";
    const hashed = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (full_name, email, password_hash, "role")
      VALUES ($1, $2, $3, 'SUPERADMIN')
      ON CONFLICT (email) DO NOTHING
      RETURNING id, full_name, email, "role", created_at;
    `;
    const result = await pool.query(query, [full_name, email, hashed]);
    if (result.rows.length) {
      console.log("SUPERADMIN created:", result.rows[0]);
    } else {
      const check = await pool.query('SELECT id, full_name, email, "role", created_at FROM users WHERE email = $1', [email]);
      if (check.rows.length) {
        console.log("User already exists:", check.rows[0]);
      } else {
        console.log("No row returned; insertion probably skipped due to conflict.");
      }
    }
    process.exit(0);
  } catch (err) {
    console.error("createSuperAdmin error:", err);
    process.exit(1);
  }
}
createSuperAdmin();
