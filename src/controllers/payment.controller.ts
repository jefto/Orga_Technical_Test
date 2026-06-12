/**
 * Contrôleur pour les routes de paiement et de validation.
 */

import { Request, Response } from 'express';
import { paymentService } from '../services/payment.service';

export const paymentController = {

    async pay(req: Request, res: Response) {
        try {
            const { orderId } = req.params;
            const { montant, reference } = req.body;

            const result = await paymentService.processPayment(Number(orderId), Number(montant), reference);

            return res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message });
        }
    },

    async complete(req: Request, res: Response) {
        try {
            const { orderId } = req.params;
            const result = await paymentService.completeOrder(Number(orderId));

            return res.status(200).json({ success: true, data: result, message: "Commande verrouillée définitivement." });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message });
        }
    },

    async getOrderPayments(req: Request, res: Response) {
        try {
            const { orderId } = req.params;
            const payments = await paymentService.getPaymentsForOrder(Number(orderId));

            return res.status(200).json({ success: true, count: payments.length, data: payments });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },
};