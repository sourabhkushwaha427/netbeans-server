// src/controllers/formAdminController.js
const contactModel = require("../models/contactModel");
const consultationModel = require("../models/consultationModel");
const ApplicationModel = require("../models/applicationModel");

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


// list (admin)
exports.listApplications = async (req, res) => {
  try {
    const limit = Math.min(200, parseInt(req.query.limit, 10) || 50);
    const offset = parseInt(req.query.offset, 10) || 0;
    const rows = await ApplicationModel.getAllApplications({ limit, offset });
    res.json({ rows, limit, offset });
  } catch (err) {
    console.error("listApplications error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const app = await ApplicationModel.getApplicationById(id);
    if (!app) return res.status(404).json({ error: "Not found" });
    res.json(app);
  } catch (err) {
    console.error("getApplication error:", err);
    res.status(500).json({ error: "Server error" });
  }
};



exports.deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await ApplicationModel.deleteApplicationById(id);
    if (!deleted) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json({ message: "Application deleted successfully" });
  } catch (err) {
    console.error("deleteApplication error:", err);
    res.status(500).json({ error: "Server error" });
  }
};



exports.deleteContact = async (req, res) => {
  const deleted = await contactModel.deleteById(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Not found" });
  res.json({ message: "Contact deleted" });
};

exports.deleteConsultation = async (req, res) => {
  const deleted = await consultationModel.deleteById(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Not found" });
  res.json({ message: "Consultation deleted" });
};

