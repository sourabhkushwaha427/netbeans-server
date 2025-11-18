// node scripts/createAdmin.js
require("dotenv").config();
const bcrypt = require("bcrypt");
const pool = require("../config/db");

async function createAdmin() {
  try {
    const full_name = process.env.INIT_ADMIN_NAME || "Initial Admin";
    const email = process.env.INIT_ADMIN_EMAIL || "admin@example.com";
    const password = process.env.INIT_ADMIN_PASSWORD || "changeme123";
    const hashed = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (full_name, email, password_hash, "role")
      VALUES ($1, $2, $3, 'ADMIN')
      ON CONFLICT (email) DO NOTHING
      RETURNING id, full_name, email, "role", created_at;
    `;
    const result = await pool.query(query, [full_name, email, hashed]);
    if (result.rows.length) {
      console.log("Admin created:", result.rows[0]);
    } else {
      console.log("Admin already exists (no-op).");
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createAdmin();
