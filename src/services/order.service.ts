/**
 * Logique métier pour la gestion des commandes.
 * Gère les ajouts d'items et les vérifications de statut.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const orderService = {

    // Créer une nouvelle commande vide
    async createOrder(methodePaiement: 'CASH' | 'MOBILE_MONEY', userId?: number) {
        return prisma.order.create({
            data: {
                montantTotal: 0,
                methodePaiement,
                statut: 'PENDING',
                userId,
                historiques: {
                    create: {
                        action: 'CREATION_COMMANDE',
                        ancienneValeur: 'NONE',
                        nouvelleValeur: 'PENDING'
                    }
                }
            }
        });
    },

    //Ajouter un article à une commande existante
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
    },

    // Lister toutes les commandes
    async getAllOrders() {
        return prisma.order.findMany({
            include: { articles: true } // On inclut les articles pour avoir un bel aperçu
        });
    },

    // Récupérer le détail complet et calculer le statut de paiement
    async getOrderDetails(orderId: number) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                articles: true,
                factures: {
                    include: { transactions: true } // On récupère l'historique financier
                },
                historiques: true
            }
        });

        if (!order) throw new Error("Commande introuvable.");

        // Calcul du total déjà payé (uniquement les factures validées)
        const totalPaye = order.factures
            .filter(f => f.statut === 'PAID')
            .reduce((somme, facture) => somme + facture.montant, 0);

        const resteAPayer = order.montantTotal - totalPaye;

        // Détermination du statut financier textuel
        let statutPaiement = 'IMPAYE';
        if (resteAPayer <= 0 && order.montantTotal > 0) statutPaiement = 'PAYE_TOTALEMENT';
        else if (totalPaye > 0 && resteAPayer > 0) statutPaiement = 'PAYE_PARTIELLEMENT';

        return {
            ...order,
            resumeFinancier: {
                totalSaisi: order.montantTotal,
                totalPaye,
                resteAPayer: resteAPayer > 0 ? resteAPayer : 0,
                statutPaiement
            }
        };
    }

};
