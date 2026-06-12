import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { requireRole, verifyToken } from '../middlewares/auth.middleware';

const paymentRouter = Router();

// Route pour la facturation et validation
/**
 * @swagger
 * /api/orders/{orderId}/pay:
 *   post:
 *     summary: Effectue un paiement (partiel ou total) pour une commande
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - montant
 *               - reference
 *             properties:
 *               montant:
 *                 type: number
 *                 example: 5000
 *               reference:
 *                 type: string
 *                 example: TMONEY_REF_12345
 *     responses:
 *       200:
 *         description: Paiement enregistré avec succès (Invoice et Transaction créées)
 *       400:
 *         description: Erreur métier
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès interdit
 */
paymentRouter.post('/:orderId/pay', verifyToken, requireRole(['CLIENT']), paymentController.pay);

// Route pour mettre le statut `complete` a une commande
/**
 * @swagger
 * /api/orders/{orderId}/complete:
 *   put:
 *     summary: Verrouille définitivement la commande
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Commande clôturée avec succès
 *       400:
 *         description: Erreur métier
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès interdit
 */
paymentRouter.put('/:orderId/complete', verifyToken, requireRole(['BOUTIQUIER']), paymentController.complete);

/**
 * @swagger
 * /api/orders/{orderId}/payments:
 *   get:
 *     summary: Récupère l'historique de tous les paiements d'une commande
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des transactions récupérée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès interdit
 *       500:
 *         description: Erreur serveur
 */
paymentRouter.get("/:orderId/payments", verifyToken, requireRole(['BOUTIQUIER']), paymentController.getOrderPayments);

export {paymentRouter};
