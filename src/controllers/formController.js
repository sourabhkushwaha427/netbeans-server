// src/controllers/formController.js

const transporter = require("../config/mailer");
const contactModel = require("../models/contactModel");
const consultationModel = require("../models/consultationModel");
const ApplicationModel = require("../models/applicationModel");
require("dotenv").config();
const path = require("path");

const MAIL_FROM = process.env.MAIL_FROM;
const MAIL_ADMIN = process.env.MAIL_ADMIN || process.env.SMTP_USER;

/* ========== Utility to Fix Numeric Errors ========== */
const cleanNumber = (val) => {
  if (!val) return null;
  if (["NA", "null", "undefined", "", " "].includes(val)) return null;
  return isNaN(val) ? null : Number(val);
};

/* ==========================================================
   CONTACT FORM (FAST RESPONSE)
========================================================== */
exports.submitContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ error: "name, email and message are required" });

    const saved = await contactModel.saveContact({ name, email, phone, message });

    // Respond instantly
    res.status(201).json({ saved, message: "Message received — we'll contact you soon!" });

    // Send emails in background
    setTimeout(async () => {
      try {
        await transporter.sendMail({
          from: MAIL_FROM,
          to: MAIL_ADMIN,
          subject: `New Contact Form — ${name}`,
          text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\n${message}`
        });

        await transporter.sendMail({
          from: MAIL_FROM,
          to: email,
          subject: `We've received your message ✔`,
          text: `Hi ${name}, thanks for contacting us!`
        });

      } catch (err) {
        console.error("Contact Email Error:", err.message);
      }
    }, 200);

  } catch (err) {
    console.error("submitContact error:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
};


/* ==========================================================
   CONSULTATION FORM (FAST RESPONSE)
========================================================== */
exports.submitConsultation = async (req, res) => {
  try {
    const { full_name, email, consultation_type, project_message } = req.body;

    if (!full_name || !email || !consultation_type || !project_message)
      return res.status(400).json({ error: "Required fields missing" });

    const saved = await consultationModel.saveConsultation(req.body);

    res.status(201).json({ saved, message: "Consultation request received successfully!" });

    // Background Email
    setTimeout(async () => {
      try {
        await transporter.sendMail({
          from: MAIL_FROM,
          to: MAIL_ADMIN,
          subject: `New Consultation Request — ${full_name}`,
          text: JSON.stringify(req.body, null, 2)
        });
      } catch (err) {
        console.error("Consultation Email Error:", err.message);
      }
    }, 200);

  } catch (err) {
    console.error("submitConsultation error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};


/* ==========================================================
   JOB APPLICATION — FAST SUBMIT + BACKGROUND EMAIL
========================================================== */
exports.submitJobApplication = async (req, res) => {
  try {
    const {
      full_name, email, phone, current_city,
      position_applying_for, highest_qualification,
      is_fresher, company_name, designation,
      years_experience, last_ctc, expected_ctc,
      linkedin_url, portfolio_url, declaration, notes
    } = req.body;

    if (!full_name || !email || !position_applying_for)
      return res.status(400).json({ error: "full_name, email & position_applying_for are required" });

    if (!req.file)
      return res.status(400).json({ error: "Resume file is required" });

    const decl = declaration === "true" || declaration === true || declaration === "on";
    if (!decl)
      return res.status(400).json({ error: "You must accept the declaration" });

    const file = req.file;
    const resume_path = `uploads/resumes/${file.filename}`;

    // Save to DB (clean numeric values)
    const saved = await ApplicationModel.saveApplication({
      full_name,
      email,
      phone,
      current_city,
      position_applying_for,
      highest_qualification,
      is_fresher: is_fresher === "true",
      company_name: company_name || null,
      designation: designation || null,
      years_experience: cleanNumber(years_experience),
      last_ctc: cleanNumber(last_ctc),
      expected_ctc: cleanNumber(expected_ctc),
      linkedin_url,
      portfolio_url,
      resume_path,
      resume_file_name: file.originalname,
      resume_content_type: file.mimetype,
      resume_uploaded_at: new Date(),
      declaration: true,
      notes: notes || null
    });

    /* ---- Respond immediately (FAST) ---- */
    res.status(201).json({
      saved,
      message: "Application submitted successfully!"
    });

    /* ---- Background email (no wait) ---- */
    setTimeout(async () => {
      try {
        // Admin Email
        await transporter.sendMail({
          from: MAIL_FROM,
          to: MAIL_ADMIN,
          subject: `New Job Application — ${full_name}`,
          text: `Name: ${full_name}\nEmail: ${email}\nPosition: ${position_applying_for}`,
          attachments: [
            {
              filename: file.originalname,
              path: path.resolve(file.path),
              contentType: file.mimetype
            }
          ]
        });

        // User Confirmation Email
        await transporter.sendMail({
          from: MAIL_FROM,
          to: email,
          subject: `Application Received ✔`,
          text: `Hi ${full_name}, we received your application for ${position_applying_for}. Our HR team will reach out soon.`
        });

        console.log("Background email job completed.");
      } catch (emailErr) {
        console.error("Email Sending Error:", emailErr.message);
      }
    }, 200);

  } catch (err) {
    console.error("submitJobApplication error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};
