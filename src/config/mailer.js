// src/config/mailer.js
const nodemailer = require("nodemailer");
require("dotenv").config();

const isGmail = (process.env.SMTP_HOST || "").includes("gmail");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || (isGmail ? "587" : "587"), 10),
  secure: process.env.SMTP_SECURE === "true", 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

transporter.verify()
  .then(() => console.log("Mailer connected — ready to send"))
  .catch((err) => console.error("Mailer verify failed:", err && err.message ? err.message : err));

module.exports = transporter;
