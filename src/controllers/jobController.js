// src/controllers/jobController.js
const Job = require("../models/jobModel");

// Allowed roles for mutating operations
const MUTATOR_ROLES = ["ADMIN", "JOB_MANAGER"];

exports.createJob = async (req, res) => {
  try {
    // req.user must be set by requireAuth
    const actor = req.user;
    if (!actor) return res.status(401).json({ error: "Unauthorized" });

    const { title, description, short_description, location, department, type } = req.body;
    if (!title || !description || !location || !type) {
      return res.status(400).json({ error: "title, description, location and type are required" });
    }

    // Only ADMIN or JOB_MANAGER can create (route level should also enforce)
    if (!MUTATOR_ROLES.includes(actor.role)) return res.status(403).json({ error: "Forbidden" });

    const created = await Job.createJob({
      title,
      description,
      short_description: short_description || null,
      location,
      department: department || null,
      type,
      posted_by_user_id: actor.id
    });

    return res.status(201).json(created);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

exports.listJobs = async (req, res) => {
  try {
    // allow query params: active=true, q=search, limit, offset
    const onlyActive = req.query.active === "true" || false;
    const qSearch = req.query.q || null;
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 50);
    const offset = parseInt(req.query.offset, 10) || 0;

    const rows = await Job.getAllJobs({ onlyActive, qSearch, limit, offset });
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.getJobById(id);
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const actor = req.user;
    if (!actor) return res.status(401).json({ error: "Unauthorized" });

    // Only ADMIN or JOB_MANAGER can update
    if (!MUTATOR_ROLES.includes(actor.role)) return res.status(403).json({ error: "Forbidden" });

    const { id } = req.params;
    const allowedFields = ["title","description","short_description","location","department","type","is_active"];
    const updates = {};
    for (const f of allowedFields) {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    }

    if (!Object.keys(updates).length) return res.status(400).json({ error: "No updatable fields provided" });

    const updated = await Job.updateJob(id, updates);
    if (!updated) return res.status(404).json({ error: "Job not found or nothing updated" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const actor = req.user;
    if (!actor) return res.status(401).json({ error: "Unauthorized" });

    if (!MUTATOR_ROLES.includes(actor.role)) return res.status(403).json({ error: "Forbidden" });

    const { id } = req.params;
    await Job.deleteJob(id);
    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
