// src/models/applicationModel.js
const pool = require("../config/db");

exports.saveApplication = async (data) => {
  const q = `
    INSERT INTO job_applications (
      full_name, email, phone, current_city,
      position_applying_for, highest_qualification,
      is_fresher, company_name, designation, years_experience, last_ctc,
      expected_ctc,
      linkedin_url, portfolio_url,
      resume_path, resume_file_name, resume_content_type, resume_uploaded_at,
      declaration, notes
    ) VALUES (
      $1,$2,$3,$4,
      $5,$6,
      $7,$8,$9,$10,$11,
      $12,
      $13,$14,
      $15,$16,$17,$18,
      $19,$20
    ) RETURNING *;
  `;
  const values = [
    data.full_name, data.email, data.phone || null, data.current_city || null,
    data.position_applying_for, data.highest_qualification || null,
    data.is_fresher || false, data.company_name || null, data.designation || null, data.years_experience || null, data.last_ctc || null,
    data.expected_ctc || null,
    data.linkedin_url || null, data.portfolio_url || null,
    data.resume_path || null, data.resume_file_name || null, data.resume_content_type || null, data.resume_uploaded_at || null,
    data.declaration || false, data.notes || null
  ];
  const { rows } = await pool.query(q, values);
  return rows[0];
};

exports.getAllApplications = async ({ limit = 50, offset = 0 } = {}) => {
  const q = `SELECT * FROM job_applications ORDER BY submitted_at DESC LIMIT $1 OFFSET $2`;
  const { rows } = await pool.query(q, [limit, offset]);
  return rows;
};

exports.getApplicationById = async (id) => {
  const { rows } = await pool.query(`SELECT * FROM job_applications WHERE id = $1`, [id]);
  return rows[0];
};

exports.deleteApplicationById = async (id) => {
  const { rows } = await pool.query(
    "DELETE FROM job_applications WHERE id = $1 RETURNING *",
    [id]
  );
  return rows[0]; 
};
