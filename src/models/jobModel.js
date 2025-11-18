// src/models/jobModel.js
const pool = require("../config/db");

exports.createJob = async ({ title, description, short_description, location, department, type, posted_by_user_id }) => {
  const q = `
    INSERT INTO job_postings
      (title, description, short_description, location, department, "type", posted_by_user_id)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING *;
  `;
  const values = [title, description, short_description, location, department, type, posted_by_user_id];
  const { rows } = await pool.query(q, values);
  return rows[0];
};

exports.getAllJobs = async ({ onlyActive = false, qSearch = null, limit = 50, offset = 0 } = {}) => {
  let base = `SELECT * FROM job_postings`;
  const where = [];
  const values = [];

  if (onlyActive) {
    values.push(true);
    where.push(`is_active = $${values.length}`);
  }

  if (qSearch) {
    values.push(`%${qSearch}%`);
    where.push(`(title ILIKE $${values.length} OR short_description ILIKE $${values.length} OR description ILIKE $${values.length})`);
  }

  if (where.length) base += ` WHERE ${where.join(" AND ")}`;

  values.push(limit);
  values.push(offset);
  base += ` ORDER BY posted_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`;

  const { rows } = await pool.query(base, values);
  return rows;
};

exports.getJobById = async (id) => {
  const { rows } = await pool.query(`SELECT * FROM job_postings WHERE id = $1`, [id]);
  return rows[0];
};

exports.updateJob = async (id, fields = {}) => {
  const allowed = ["title", "description", "short_description", "location", "department", "type", "is_active"];
  const set = [];
  const values = [];
  let idx = 1;

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      set.push(`"${key === 'type' ? 'type' : key}" = $${idx}`); // keep type quoted
      values.push(fields[key]);
      idx++;
    }
  }

  if (!set.length) return null;

  values.push(id);
  const q = `UPDATE job_postings SET ${set.join(", ")} WHERE id = $${idx} RETURNING *`;
  const { rows } = await pool.query(q, values);
  return rows[0];
};

exports.deleteJob = async (id) => {
  await pool.query(`DELETE FROM job_postings WHERE id = $1`, [id]);
  return { deleted: true };
};
