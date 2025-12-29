// src/models/contactModel.js
const pool = require("../config/db");

exports.saveContact = async ({ name, email, phone = null, message }) => {
  const q = `
    INSERT INTO contact_submissions (name, email, phone, message)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const { rows } = await pool.query(q, [name, email, phone, message]);
  return rows[0];
};

exports.getAllContacts = async ({ limit = 50, offset = 0 } = {}) => {
  const q = `SELECT * FROM contact_submissions ORDER BY submitted_at DESC LIMIT $1 OFFSET $2`;
  const { rows } = await pool.query(q, [limit, offset]);
  return rows;
};

exports.getContactById = async (id) => {
  const { rows } = await pool.query(`SELECT * FROM contact_submissions WHERE id = $1`, [id]);
  return rows[0];
};

exports.markAsRead = async (id) => {
  const q = `UPDATE contact_submissions SET is_read = true WHERE id = $1 RETURNING *`;
  const { rows } = await pool.query(q, [id]);
  return rows[0];
};

exports.deleteById = async (id) => {
  const { rows } = await pool.query(
    "DELETE FROM contact_submissions WHERE id=$1 RETURNING *",
    [id]
  );
  return rows[0];
};
