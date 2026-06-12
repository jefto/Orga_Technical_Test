/**
 * Logique métier pour la facturation et l'encaissement.
 * Gère les paiements multiples et le verrouillage de la commande.
 */

import { PrismaClient, PaymentMethod, InvoiceStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const paymentService = {

    // 1. Enregistrer un paiement (Partiel ou Total)
    async processPayment(orderId: number, montantPaye: number, referenceTx: string) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { factures: true }
        });

        if (!order || order.statut === 'COMPLETED') {
            throw new Error("Action impossible : Commande introuvable ou déjà clôturée.");
        }

        return await prisma.$transaction(async (tx) => {
            // Étape A : Créer la facture (Invoice) pour ce paiement spécifique
            const newInvoice = await tx.invoice.create({
                data: {
                    orderId: order.id,
                    montant: montantPaye,
                    statut: 'PAID'
                }
            });

            // Étape B : Créer la trace de la transaction financière
            const transaction = await tx.paymentTransaction.create({
                data: {
                    invoiceId: newInvoice.id,
                    reference: referenceTx,
                    montant: montantPaye,
                    statut: 'PAID'
                }
            });

            // Étape C : Historiser l'action de paiement
            await tx.orderHistory.create({
                data: {
                    action: 'PAIEMENT_RECU',
                    ancienneValeur: '0',
                    nouvelleValeur: String(montantPaye),
                    orderId: order.id
                }
            });

            return { invoice: newInvoice, transaction };
        });
    },

    // 2. Valider définitivement la commande (Le verrou)
    async completeOrder(orderId: number) {
        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order) throw new Error("Commande introuvable.");

        // Passage du statut à COMPLETED, ce qui bloque toutes les futures modifications
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { statut: 'COMPLETED' }
        });

        await prisma.orderHistory.create({
            data: {
                action: 'CLOTURE_COMMANDE',
                ancienneValeur: order.statut,
                nouvelleValeur: 'COMPLETED',
                orderId: order.id
            }
        });

        return updatedOrder;
    }
};