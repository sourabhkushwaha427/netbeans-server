// src/controllers/formController.js
const transporter = require("../config/mailer");
const contactModel = require("../models/contactModel");
const consultationModel = require("../models/consultationModel");
require("dotenv").config();
const ApplicationModel = require("../models/applicationModel");
const path = require("path");
const { UPLOAD_DIR } = require("../config/multer");
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



exports.submitJobApplication = async (req, res) => {
  try {
    // fields from form-data
    const {
      full_name, email, phone, current_city,
      position_applying_for, highest_qualification,
      is_fresher, company_name, designation, years_experience, last_ctc,
      expected_ctc, linkedin_url, portfolio_url, declaration, notes
    } = req.body;

    // required checks
    if (!full_name || !email || !position_applying_for) {
      return res.status(400).json({ error: "full_name, email and position_applying_for are required" });
    }
    // declaration must be present and true-like
    const decl = declaration === "true" || declaration === true || declaration === "on";
    if (!decl) {
      return res.status(400).json({ error: "You must accept the declaration" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Resume file is required" });
    }

    const file = req.file;

    // Debug: log important file properties to help diagnose storage type
    console.log("Uploaded file object:", {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,       // undefined if memoryStorage
      filename: file.filename,
      bufferPresent: !!file.buffer
    });

    // Determine resume_path for DB (relative path is fine in DB, but we resolve for attachment)
    const resume_path_rel = path.join("uploads", "resumes", file.filename || file.originalname);
    const resume_path_for_db = resume_path_rel;
    // For attachment (if disk storage) compute absolute path
    let attachment;
    if (file.path) {
      // Disk storage provided a path. Ensure absolute.
      const absPath = path.isAbsolute(file.path) ? file.path : path.resolve(process.cwd(), file.path);
      attachment = { filename: file.originalname, path: absPath, contentType: file.mimetype };
      console.log("Attaching resume from disk at:", absPath);
    } else if (file.buffer) {
      // Memory storage: attach from buffer
      attachment = { filename: file.originalname, content: file.buffer, contentType: file.mimetype };
      console.log("Attaching resume from buffer, size:", file.buffer.length);
    } else {
      // last-resort: try to resolve relative path (if file was saved elsewhere)
      const fallbackPath = path.resolve(process.cwd(), resume_path_rel);
      attachment = { filename: file.originalname, path: fallbackPath, contentType: file.mimetype };
      console.log("No file.path or buffer; attempting fallback attach at:", fallbackPath);
    }

    // build data object for DB
    const saved = await ApplicationModel.saveApplication({
      full_name, email, phone, current_city,
      position_applying_for, highest_qualification,
      is_fresher: is_fresher === "true" || is_fresher === true,
      company_name, designation,
      years_experience: years_experience ? parseFloat(years_experience) : null,
      last_ctc: last_ctc ? parseFloat(last_ctc) : null,
      expected_ctc: expected_ctc ? parseFloat(expected_ctc) : null,
      linkedin_url, portfolio_url,
      resume_path: resume_path_for_db,
      resume_file_name: file.originalname,
      resume_content_type: file.mimetype,
      resume_uploaded_at: new Date(),
      declaration: true,
      notes: notes || null
    });

    // verify transporter optionally (log only)
    try {
      await transporter.verify();
      console.log("transporter.verify(): OK");
    } catch (vErr) {
      console.warn("transporter.verify() failed (but will still attempt send):", vErr && vErr.message ? vErr.message : vErr);
    }

    // Prepare admin mail including the resume as attachment
    const adminMail = {
      from: MAIL_FROM,
      to: MAIL_ADMIN,
      subject: `New job application from ${full_name} — ${position_applying_for}`,
      text: `Name: ${full_name}\nEmail: ${email}\nPosition: ${position_applying_for}\nResume saved at: ${resume_path_for_db}`,
      html: `<p><strong>Name:</strong> ${full_name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Position:</strong> ${position_applying_for}</p>`,
      attachments: attachment ? [attachment] : []
    };

    // Send admin mail (fail-safe: don't throw to client if mail fails)
    try {
      const info = await transporter.sendMail(adminMail);
      console.log("Admin mail sent (application) — info:", info);
    } catch (e) {
      console.error("Failed to send admin mail for application:", e && e.stack ? e.stack : e);
      // return success for DB save but inform caller admin mail failed
      return res.status(201).json({ saved, warning: "Application saved but admin email failed to send. Check server logs." });
    }

    // send confirmation to applicant (optional)
    try {
      const userMail = {
        from: MAIL_FROM,
        to: email,
        subject: `Thanks for applying — ${position_applying_for}`,
        text: `Hi ${full_name},\n\nThanks for applying for ${position_applying_for}. We have received your application.`,
        html: `<p>Hi ${full_name},</p><p>Thanks for applying for <strong>${position_applying_for}</strong>. We have received your application.</p>`
      };
      const infoUser = await transporter.sendMail(userMail);
      console.log("User confirmation mail sent (application):", infoUser);
    } catch (uErr) {
      console.error("Failed to send user confirmation mail (application):", uErr && uErr.stack ? uErr.stack : uErr);
      // continue — DB saved and admin notified
    }

    return res.status(201).json({ saved });
  } catch (err) {
    console.error("submitJobApplication error:", err && err.stack ? err.stack : err);
    return res.status(500).json({ error: "Server error" });
  }
};
