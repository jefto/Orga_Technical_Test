/**
 *  Contrôleur pour les routes de commande.
 */

import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { orderService } from '../services/order.service';

export const orderController = {

    async createOrder(req: AuthRequest, res: Response) {
        try {
            const { methodePaiement } = req.body;
            const userId = req.user?.userId;

            if (!['CASH', 'MOBILE_MONEY'].includes(methodePaiement)) {
                return res.status(400).json({ success: false, message: "Méthode de paiement invalide (CASH ou MOBILE_MONEY attendu)." });
            }

            const newOrder = await orderService.createOrder(methodePaiement, userId);

            return res.status(201).json({ success: true, data: newOrder });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message });
        }
    },

    async addItem(req: Request, res: Response) {
        try {
            const { orderId } = req.params;
            const itemData = req.body;

            const newItem = await orderService.addItemToOrder(Number(orderId), itemData);

            return res.status(201).json({ success: true, data: newItem });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message });
        }
    },

    async getAll(req: Request, res: Response) {
        try {
            const orders = await orderService.getAllOrders();
            return res.status(200).json({ success: true, data: orders });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    async getDetails(req: AuthRequest, res: Response) {
        try {
            const { orderId } = req.params;
            const details = await orderService.getOrderDetails(Number(orderId));

            if (req.user?.role === 'CLIENT' && details.userId !== req.user.userId) {
                return res.status(403).json({ success: false, message: "Accès interdit. Cette commande ne vous appartient pas." });
            }

            return res.status(200).json({ success: true, data: details });
        } catch (error: any) {
            return res.status(404).json({ success: false, message: error.message });
        }
    }
};
