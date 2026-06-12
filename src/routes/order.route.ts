import { Router } from 'express';
import { orderController } from '../controllers/order.controller';

const orderRouter = Router();

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Crée une nouvelle commande vide
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - methodePaiement
 *             properties:
 *               methodePaiement:
 *                 type: string
 *                 enum: [CASH, MOBILE_MONEY]
 *                 example: "MOBILE_MONEY"
 *     responses:
 *       201:
 *         description: Commande initialisée avec succès
 *       400:
 *         description: Erreur de validation
 */
orderRouter.post("/", orderController.createOrder);

// Route pour la gestion du panier
/**
 * @swagger
 * /api/orders/{orderId}/items:
 *   post:
 *     summary: Ajoute un nouvel article à une commande existante
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: L'ID de la commande
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nomMenu
 *               - prixUnitaire
 *               - quantite
 *             properties:
 *               nomMenu:
 *                 type: string
 *                 example: Poulet DG
 *               prixUnitaire:
 *                 type: number
 *                 example: 3500
 *               quantite:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Article ajouté avec succès
 *       400:
 *         description: Erreur (ex. Commande déjà verrouillée)
 */
orderRouter.post('/:orderId/items', orderController.addItem);


export {orderRouter} ;