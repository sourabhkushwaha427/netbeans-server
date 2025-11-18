// src/controllers/formAdminController.js
const contactModel = require("../models/contactModel");
const consultationModel = require("../models/consultationModel");

exports.listContacts = async (req, res) => {
  try {
    const limit = Math.min(500, parseInt(req.query.limit, 10) || 50);
    const offset = parseInt(req.query.offset, 10) || 0;
    const rows = await contactModel.getAllContacts({ limit, offset });
    res.json({ rows, limit, offset });
  } catch (err) {
    console.error("listContacts error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getContact = async (req, res) => {
  try {
    const { id } = req.params;
    const row = await contactModel.getContactById(id);
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err) {
    console.error("getContact error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.markContactRead = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await contactModel.markAsRead(id);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    console.error("markContactRead error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.listConsultations = async (req, res) => {
  try {
    const limit = Math.min(500, parseInt(req.query.limit, 10) || 50);
    const offset = parseInt(req.query.offset, 10) || 0;
    const rows = await consultationModel.getAllConsultations({ limit, offset });
    res.json({ rows, limit, offset });
  } catch (err) {
    console.error("listConsultations error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const row = await consultationModel.getConsultationById(id);
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err) {
    console.error("getConsultation error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.markConsultationContacted = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await consultationModel.markAsContacted(id);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    console.error("markConsultationContacted error:", err);
    res.status(500).json({ error: err.message });
  }
};
