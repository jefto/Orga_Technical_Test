/**
 * Logique métier pour la gestion des commandes.
 * Gère les ajouts d'items et les vérifications de statut.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const orderService = {

    async addItemToOrder(orderId: number, itemData: { nomMenu: string, prixUnitaire: number, quantite: number }) {
        // 1. Vérifier si la commande existe et n'est pas complétée
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { articles: true }
        });

        if (!order || order.statut === 'COMPLETED') {
            throw new Error("Commande inexistante ou déjà verrouillée.");
        }

        // 2. Utilisation d'une transaction pour l'intégrité
        return await prisma.$transaction(async (tx) => {
            // Ajout de l'item
            const newItem = await tx.orderItem.create({
                data: {
                    ...itemData,
                    sousTotal: itemData.prixUnitaire * itemData.quantite,
                    orderId
                }
            });

            // Recalcul du montant total
            const newTotal = order.montantTotal + newItem.sousTotal;

            // Mise à jour de la commande
            await tx.order.update({
                where: { id: orderId },
                data: { montantTotal: newTotal }
            });

            // Création de l'historique
            await tx.orderHistory.create({
                data: {
                    action: 'AJOUT_ITEM',
                    ancienneValeur: String(order.montantTotal),
                    nouvelleValeur: String(newTotal),
                    orderId
                }
            });

            return newItem;
        });
    }
};