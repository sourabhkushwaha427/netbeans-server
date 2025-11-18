// src/controllers/formController.js
const transporter = require("../config/mailer");
const contactModel = require("../models/contactModel");
const consultationModel = require("../models/consultationModel");
require("dotenv").config();
const MAIL_FROM = process.env.MAIL_FROM;
const MAIL_ADMIN = process.env.MAIL_ADMIN || process.env.SMTP_USER;

exports.submitContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: "name, email and message are required" });
    const adminMail = {
      from: MAIL_FROM,
      to: MAIL_ADMIN,
      subject: `New contact form from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || "-"}\n\nMessage:\n${message}`,
      html: `<p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Phone:</strong> ${phone || "-"}</p>
             <hr/>
             <p>${message}</p>`
    };
    await transporter.sendMail(adminMail);
    const userConfirm = {
      from: MAIL_FROM,
      to: email,
      subject: `Thanks for contacting us`,
      text: `Hi ${name},\n\nThanks for contacting us. We received your message and will respond soon.`,
      html: `<p>Hi ${name},</p><p>Thanks for contacting us. We received your message and will respond soon.</p>`
    };
    const saved = await contactModel.saveContact({ name, email, phone, message });
    return res.status(201).json({ saved });
  } catch (err) {
    console.error("submitContact error:", err);
    return res.status(502).json({ error: "Failed to send email" });
  }
};

exports.submitConsultation = async (req, res) => {
  try {
    const { full_name, email, phone, consultation_type, other_type_details, preferred_date, meeting_mode, project_message } = req.body;
    if (!full_name || !email || !consultation_type || !project_message) {
      return res.status(400).json({ error: "full_name, email, consultation_type and project_message are required" });
      }
    const adminMail = {
      from: MAIL_FROM,
      to: MAIL_ADMIN,
      subject: `New consultation request from ${full_name}`,
      text: `Name: ${full_name}\nEmail: ${email}\nPhone: ${phone || "-"}\nType: ${consultation_type}\nOther details: ${other_type_details || "-"}\nPreferred date: ${preferred_date || "-"}\nMeeting mode: ${meeting_mode || "-"}\n\nMessage:\n${project_message}`,
      html: `<p><strong>Name:</strong> ${full_name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Phone:</strong> ${phone || "-"}</p>
             <p><strong>Consultation type:</strong> ${consultation_type}</p>
             <p><strong>Other details:</strong> ${other_type_details || "-"}</p>
             <p><strong>Preferred date:</strong> ${preferred_date || "-"}</p>
             <p><strong>Meeting mode:</strong> ${meeting_mode || "-"}</p>
             <hr/>
             <p>${project_message}</p>`
    };
    await transporter.sendMail(adminMail);
    const saved = await consultationModel.saveConsultation({ full_name, email, phone, consultation_type, other_type_details, preferred_date, meeting_mode, project_message });
    return res.status(201).json({ saved });
  } catch (err) {
    console.error("submitConsultation error:", err);
    return res.status(502).json({ error: "Failed to send email" });
  }
};
