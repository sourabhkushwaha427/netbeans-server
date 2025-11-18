const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { requireAdmin, requireAuth } = require("../middleware/authMiddleware");

// All routes below expect authentication; creating users requires ADMIN
router.get("/", requireAuth, requireAdmin, userController.getUsers);
router.get("/:id", requireAuth, requireAdmin, userController.getUser);
router.post("/", requireAuth, requireAdmin, userController.adminCreateUser); // ADMIN creates new user
router.patch("/:id/role", requireAuth, requireAdmin, userController.updateRole);
router.delete("/:id", requireAuth, requireAdmin, userController.deleteUser);

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get all users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *
 *   post:
 *     tags:
 *       - Users
 *     summary: Admin creates a new user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreate'
 *     responses:
 *       201:
 *         description: Created user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *
 * /api/users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user by id
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
 *         description: User object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *
 *   delete:
 *     tags:
 *       - Users
 *     summary: Delete user by id
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
 *
 * /api/users/{id}/role:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Update user's role (ADMIN only)
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
 *               role:
 *                 type: string
 *                 enum: [ADMIN, JOB_MANAGER]
 *     responses:
 *       200:
 *         description: role updated
 */

module.exports = router;
