import { Router } from "express";

import { healthController } from "../controllers/health.controller";

const healthRouter = Router();

/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Healthcheck de l'API
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: API et base de donnees disponibles
 *       503:
 *         description: API disponible, base de donnees indisponible
 */
healthRouter.get("/health", healthController.check);

export { healthRouter };

