/**
 *  Contrôleur pour les routes de commande.
 */

import { Request, Response } from 'express';
import { orderService } from '../services/order.service';

export const orderController = {

    async createOrder(req: Request, res: Response) {
        try {
            const { methodePaiement } = req.body;

            if (!['CASH', 'MOBILE_MONEY'].includes(methodePaiement)) {
                return res.status(400).json({ success: false, message: "Méthode de paiement invalide (CASH ou MOBILE_MONEY attendu)." });
            }

            const newOrder = await orderService.createOrder(methodePaiement);

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
    }
};