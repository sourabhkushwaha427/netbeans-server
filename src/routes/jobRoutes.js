// src/routes/jobRoutes.js
const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");
const { requireAuth, requireRoles } = require("../middleware/authMiddleware");

// Public read: list and get (but requireAuth applied to keep consistent - remove if you want public)
router.get("/", requireAuth, jobController.listJobs);
router.get("/:id", requireAuth, jobController.getJob);

// Mutations: only ADMIN or JOB_MANAGER
router.post("/", requireAuth, requireRoles(["ADMIN","JOB_MANAGER","SUPERADMIN"]), jobController.createJob);
router.patch("/:id", requireAuth, requireRoles(["ADMIN","JOB_MANAGER","SUPERADMIN"]), jobController.updateJob);
router.delete("/:id", requireAuth, requireRoles(["ADMIN","JOB_MANAGER","SUPERADMIN"]), jobController.deleteJob);


 /**
  * @openapi
  * /api/jobs:
  *   get:
  *     tags:
  *       - Jobs
  *     summary: List job postings (supports ?active=true & ?q=search)
  *     security:
  *       - bearerAuth: []
  *     parameters:
  *       - name: active
  *         in: query
  *         schema:
  *           type: boolean
  *       - name: q
  *         in: query
  *         schema:
  *           type: string
  *       - name: limit
  *         in: query
  *         schema:
  *           type: integer
  *       - name: offset
  *         in: query
  *         schema:
  *           type: integer
  *     responses:
  *       200:
  *         description: list of jobs
  *
  *   post:
  *     tags:
  *       - Jobs
  *     summary: Create a job posting (ADMIN or JOB_MANAGER)
  *     security:
  *       - bearerAuth: []
  *     requestBody:
  *       required: true
  *       content:
  *         application/json:
  *           schema:
  *             type: object
  *             required: [title, description, location, type]
  *             properties:
  *               title: { type: string, example: "Frontend Developer" }
  *               description: { type: string, example: "Full job description" }
  *               short_description: { type: string, example: "Short blurb" }
  *               location: { type: string, example: "Bhopal" }
  *               department: { type: string, example: "Engineering" }
  *               type: { type: string, example: "Full-time" }
  *     responses:
  *       201:
  *         description: created job
  *
  * /api/jobs/{id}:
  *   get:
  *     tags:
  *       - Jobs
  *     summary: Get job by id
  *     security:
  *       - bearerAuth: []
  *     parameters:
  *       - name: id
  *         in: path
  *         required: true
  *         schema:
  *           type: string
  *           format: uuid
  *     responses:
  *       200:
  *         description: job object
  *
  *   patch:
  *     tags:
  *       - Jobs
  *     summary: Update a job (ADMIN or JOB_MANAGER)
  *     security:
  *       - bearerAuth: []
  *     parameters:
  *       - name: id
  *         in: path
  *         required: true
  *         schema:
  *           type: string
  *     requestBody:
  *       required: true
  *       content:
  *         application/json:
  *           schema:
  *             type: object
  *             properties:
  *               title: { type: string }
  *               description: { type: string }
  *               short_description: { type: string }
  *               location: { type: string }
  *               department: { type: string }
  *               type: { type: string }
  *               is_active: { type: boolean }
  *     responses:
  *       200:
  *         description: updated job
  *
  *   delete:
  *     tags:
  *       - Jobs
  *     summary: Delete a job (ADMIN or JOB_MANAGER)
  *     security:
  *       - bearerAuth: []
  *     parameters:
  *       - name: id
  *         in: path
  *         required: true
  *         schema:
  *           type: string
  *     responses:
  *       200:
  *         description: deleted
  */

module.exports = router;
