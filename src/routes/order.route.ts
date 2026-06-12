import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { requireRole, verifyToken } from '../middlewares/auth.middleware';

const orderRouter = Router();

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Crée une nouvelle commande vide
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès interdit
 */
orderRouter.post("/", verifyToken, requireRole(['CLIENT']), orderController.createOrder);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Liste toutes les commandes
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des commandes récupérée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès interdit
 *       500:
 *         description: Erreur serveur
 */
orderRouter.get("/", verifyToken, requireRole(['BOUTIQUIER']), orderController.getAll);

// Route pour la gestion du panier
/**
 * @swagger
 * /api/orders/{orderId}/items:
 *   post:
 *     summary: Ajoute un nouvel article à une commande existante
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès interdit
 */
orderRouter.post('/:orderId/items', verifyToken, requireRole(['CLIENT']), orderController.addItem);

/**
 * @swagger
 * /api/orders/{orderId}:
 *   get:
 *     summary: Récupère les détails complets d'une commande
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: L'ID de la commande
 *     responses:
 *       200:
 *         description: Détails de la commande récupérés avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès interdit
 *       404:
 *         description: Commande introuvable
 */
orderRouter.get("/:orderId", verifyToken, requireRole(['CLIENT', 'BOUTIQUIER']), orderController.getDetails);


export {orderRouter} ;
