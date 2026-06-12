import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';

const paymentRouter = Router();

// Route pour la facturation et validation
/**
 * @swagger
 * /api/orders/{orderId}/pay:
 *   post:
 *     summary: Effectue un paiement (partiel ou total) pour une commande
 *     tags: [Payments]
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
 */
paymentRouter.post('/:orderId/pay', paymentController.pay);

// Route pour mettre le statut `complete` a une commande
/**
 * @swagger
 * /api/orders/{orderId}/complete:
 *   put:
 *     summary: Verrouille définitivement la commande
 *     tags: [Payments]
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
 */
paymentRouter.put('/:orderId/complete', paymentController.complete);

export {paymentRouter};
