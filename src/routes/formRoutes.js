// src/routes/formRoutes.js
const express = require("express");
const router = express.Router();

const formController = require("../controllers/formController");
const adminController = require("../controllers/formAdminController");
const { upload } = require("../config/multer");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");

/**
 * @openapi
 * tags:
 *   - name: Forms
 *     description: Contact, Consultation and Job Application endpoints
 */

/**
 * @openapi
 * /api/forms/contact:
 *   post:
 *     tags: [Forms]
 *     summary: Submit contact form
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, message]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               phone: { type: string }
 *               message: { type: string }
 *     responses:
 *       201:
 *         description: saved entry
 *       400:
 *         description: validation error
 */
router.post("/contact", formController.submitContact);

/**
 * @openapi
 * /api/forms/consultation:
 *   post:
 *     tags: [Forms]
 *     summary: Submit consultation request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [full_name, email, consultation_type, project_message]
 *             properties:
 *               full_name: { type: string }
 *               email: { type: string, format: email }
 *               phone: { type: string }
 *               consultation_type: { type: string }
 *               other_type_details: { type: string }
 *               preferred_date: { type: string, format: date }
 *               meeting_mode: { type: string }
 *               project_message: { type: string }
 *     responses:
 *       201:
 *         description: saved entry
 *       400:
 *         description: validation error
 */
router.post("/consultation", formController.submitConsultation);

/**
 * @openapi
 * /api/forms/job-application:
 *   post:
 *     tags: [Forms]
 *     summary: Submit a job application (multipart/form-data)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [full_name, email, position_applying_for, declaration, resume]
 *             properties:
 *               full_name: { type: string }
 *               email: { type: string, format: email }
 *               phone: { type: string }
 *               current_city: { type: string }
 *               position_applying_for: { type: string }
 *               highest_qualification: { type: string }
 *               is_fresher: { type: boolean }
 *               company_name: { type: string }
 *               designation: { type: string }
 *               years_experience: { type: number }
 *               last_ctc: { type: number }
 *               expected_ctc: { type: number }
 *               linkedin_url: { type: string, format: uri }
 *               portfolio_url: { type: string, format: uri }
 *               declaration: { type: boolean }
 *               notes: { type: string }
 *               resume:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: application saved
 *       400:
 *         description: validation error
 */
router.post("/job-application", upload.single("resume"), formController.submitJobApplication);

/* ---------------- Admin endpoints (protected) ---------------- */

/**
 * @openapi
 * /api/forms/contact:
 *   get:
 *     tags: [Forms]
 *     summary: List contact submissions (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200:
 *         description: list of contacts
 */
router.get("/contact", requireAuth, requireAdmin, adminController.listContacts);
router.get("/contact/:id", requireAuth, requireAdmin, adminController.getContact);
router.patch("/contact/:id/read", requireAuth, requireAdmin, adminController.markContactRead);

/**
 * @openapi
 * /api/forms/consultation:
 *   get:
 *     tags: [Forms]
 *     summary: List consultation requests (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200:
 *         description: list of consultations
 */
router.get("/consultation", requireAuth, requireAdmin, adminController.listConsultations);
router.get("/consultation/:id", requireAuth, requireAdmin, adminController.getConsultation);
router.patch("/consultation/:id/read", requireAuth, requireAdmin, adminController.markConsultationContacted);

/**
 * @openapi
 * /api/forms/job-applications:
 *   get:
 *     tags: [Forms]
 *     summary: List job applications (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200:
 *         description: list of job applications
 */
router.get("/job-applications", requireAuth, requireAdmin, adminController.listApplications);
router.get("/job-applications/:id", requireAuth, requireAdmin, adminController.getApplication);

module.exports = router;
