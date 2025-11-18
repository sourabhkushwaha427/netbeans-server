// src/routes/formRoutes.js
const express = require("express");
const router = express.Router();
const formController = require("../controllers/formController");
const adminController = require("../controllers/formAdminController");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");

// Public endpoints (no auth required)
router.post("/contact", formController.submitContact);
router.post("/consultation", formController.submitConsultation);

// Admin endpoints (protected)
router.get("/contact", requireAuth, requireAdmin, adminController.listContacts);
router.get("/contact/:id", requireAuth, requireAdmin, adminController.getContact);
router.patch("/contact/:id/read", requireAuth, requireAdmin, adminController.markContactRead);
router.get("/consultation", requireAuth, requireAdmin, adminController.listConsultations);
router.get("/consultation/:id", requireAuth, requireAdmin, adminController.getConsultation);
router.patch("/consultation/:id/read", requireAuth, requireAdmin, adminController.markConsultationContacted);

/**
 * @openapi
 * /api/forms/contact:
 *   get:
 *     tags:
 *       - Forms
 *     summary: List contact submissions (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: A paginated list of contact submissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rows:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                         format: email
 *                       phone:
 *                         type: string
 *                         nullable: true
 *                       message:
 *                         type: string
 *                       submitted_at:
 *                         type: string
 *                         format: date-time
 *                       is_read:
 *                         type: boolean
 *                 limit:
 *                   type: integer
 *                 offset:
 *                   type: integer
 *
 * /api/forms/contact/{id}:
 *   get:
 *     tags:
 *       - Forms
 *     summary: Get a contact submission by id (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Contact submission object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string, format: uuid }
 *                 name: { type: string }
 *                 email: { type: string, format: email }
 *                 phone: { type: string, nullable: true }
 *                 message: { type: string }
 *                 submitted_at: { type: string, format: date-time }
 *                 is_read: { type: boolean }
 *       404:
 *         description: Not found
 *
 * /api/forms/contact/{id}/read:
 *   patch:
 *     tags:
 *       - Forms
 *     summary: Mark a contact submission as read (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Updated contact submission
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string, format: uuid }
 *                 is_read: { type: boolean }
 *       404:
 *         description: Not found
 *
 * /api/forms/consultation:
 *   get:
 *     tags:
 *       - Forms
 *     summary: List consultation requests (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: A paginated list of consultation requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rows:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       full_name:
 *                         type: string
 *                       email:
 *                         type: string
 *                         format: email
 *                       phone:
 *                         type: string
 *                         nullable: true
 *                       consultation_type:
 *                         type: string
 *                       other_type_details:
 *                         type: string
 *                         nullable: true
 *                       preferred_date:
 *                         type: string
 *                         format: date
 *                         nullable: true
 *                       meeting_mode:
 *                         type: string
 *                         nullable: true
 *                       project_message:
 *                         type: string
 *                       submitted_at:
 *                         type: string
 *                         format: date-time
 *                       is_contacted:
 *                         type: boolean
 *                 limit:
 *                   type: integer
 *                 offset:
 *                   type: integer
 *
 * /api/forms/consultation/{id}:
 *   get:
 *     tags:
 *       - Forms
 *     summary: Get a consultation request by id (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Consultation request object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string, format: uuid }
 *                 full_name: { type: string }
 *                 email: { type: string, format: email }
 *                 phone: { type: string, nullable: true }
 *                 consultation_type: { type: string }
 *                 other_type_details: { type: string, nullable: true }
 *                 preferred_date: { type: string, format: date, nullable: true }
 *                 meeting_mode: { type: string, nullable: true }
 *                 project_message: { type: string }
 *                 submitted_at: { type: string, format: date-time }
 *                 is_contacted: { type: boolean }
 *       404:
 *         description: Not found
 *
 * /api/forms/consultation/{id}/read:
 *   patch:
 *     tags:
 *       - Forms
 *     summary: Mark a consultation request as contacted (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Updated consultation request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string, format: uuid }
 *                 is_contacted: { type: boolean }
 *       404:
 *         description: Not found
 */


/**
 * @openapi
 * /api/forms/contact:
 *   post:
 *     tags:
 *       - Forms
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
 *
 * /api/forms/consultation:
 *   post:
 *     tags:
 *       - Forms
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
 */

module.exports = router;
