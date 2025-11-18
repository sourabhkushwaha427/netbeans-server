const pool = require("../config/db");

// create user (admin creates users)
exports.createUser = async ({ full_name, email, password_hash, role = "JOB_MANAGER", created_by_admin_id = null }) => {
  const query = `
    INSERT INTO users (full_name, email, password_hash, "role", created_by_admin_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, full_name, email, "role", created_at, created_by_admin_id;
  `;
  const values = [full_name, email, password_hash, role, created_by_admin_id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

exports.getAllUsers = async () => {
  const result = await pool.query(`SELECT id, full_name, email, "role", created_at, created_by_admin_id FROM users ORDER BY created_at DESC`);
  return result.rows;
};

exports.getUserById = async (id) => {
  const result = await pool.query(`SELECT id, full_name, email, "role", created_at, created_by_admin_id FROM users WHERE id = $1`, [id]);
  return result.rows[0];
};

exports.getUserByEmail = async (email) => {
  const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
  return result.rows[0];
};

exports.updateUserRole = async (id, newRole) => {
  const result = await pool.query(
    `UPDATE users SET "role" = $1 WHERE id = $2 RETURNING id, full_name, email, "role", created_at, created_by_admin_id`,
    [newRole, id]
  );
  return result.rows[0];
};

exports.deleteUser = async (id) => {
  await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
  return { deleted: true };
};
