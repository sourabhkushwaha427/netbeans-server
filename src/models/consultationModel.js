// src/models/consultationModel.js
const pool = require("../config/db");

exports.saveConsultation = async (data) => {
  const q = `
    INSERT INTO consultation_requests
      (full_name, email, phone, consultation_type, other_type_details, preferred_date, meeting_mode, project_message)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *;
  `;
  const values = [
    data.full_name, data.email, data.phone || null, data.consultation_type,
    data.other_type_details || null, data.preferred_date || null, data.meeting_mode || null, data.project_message
  ];
  const { rows } = await pool.query(q, values);
  return rows[0];
};

exports.getAllConsultations = async ({ limit = 50, offset = 0 } = {}) => {
  const q = `SELECT * FROM consultation_requests ORDER BY submitted_at DESC LIMIT $1 OFFSET $2`;
  const { rows } = await pool.query(q, [limit, offset]);
  return rows;
};

exports.getConsultationById = async (id) => {
  const { rows } = await pool.query(`SELECT * FROM consultation_requests WHERE id = $1`, [id]);
  return rows[0];
};

exports.markAsContacted = async (id) => {
  const q = `UPDATE consultation_requests SET is_contacted = true WHERE id = $1 RETURNING *`;
  const { rows } = await pool.query(q, [id]);
  return rows[0];
};
