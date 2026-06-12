import { Router } from "express";
import { authController } from "../controllers/auth.controller";

const authRouter = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Inscrit un nouvel utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *               role:
 *                 type: string
 *                 enum: [CLIENT, BOUTIQUIER]
 *                 example: CLIENT
 *     responses:
 *       201:
 *         description: Inscription réussie
 *       400:
 *         description: Données invalides ou email déjà utilisé
 */
authRouter.post("/register", authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connecte un utilisateur et retourne un token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Connexion réussie
 *       400:
 *         description: Champs requis manquants
 *       401:
 *         description: Identifiants incorrects
 */
authRouter.post("/login", authController.login);

export { authRouter };
