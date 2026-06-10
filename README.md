# 1. Reformulation du besoin (Le cœur du problème)

Actuellement, dès qu'une commande est validée, elle est considérée coAmme terminée et figée.
L'objectif de cette évolution est de la rendre dynamique. Tant qu'une commande n'est pas
clôturée définitivement (statut différent de `completed`), le client ou le serveur doit
pouvoir la rouvrir, ajouter des plats et modifier les quantités.

Le vrai défi technique de ce test réside dans la gestion de la facturation : il faut savoir
jongler avec les statuts des paiements, en particulier pour le Mobile Money, afin de gérer
les factures impayées ou les compléments à payer sans jamais écraser la trace d'un paiement
déjà effectué.

# 2. Liste des attentes et fonctionnalités à mettre en place

Voici exactement ce que ton API devra être capable de faire :

## Gestion Globale de la Commande
- Bloquer toute modification si le statut de la commande est `completed`.
- Autoriser l'ajout de nouveaux menus/plats et la modification des quantités si le statut est différent de `completed`.
- Recalculer automatiquement le montant total de la commande après chaque modification.
- Conserver l'historique du panier.
- Verrouiller la commande et passer son statut à `completed` lors de la validation finale par le marchand.

## Gestion des Paiements : CASH
- Permettre d'enrichir la commande autant de fois que nécessaire avant la validation.
- Considérer le paiement comme encaissé uniquement lors de la validation finale.

## Gestion des Paiements : MOBILE MONEY (La complexité principale)
- Si la facture initiale n'est pas encore payée (statut `init`) :
  - Mettre à jour directement cette facture existante avec le nouveau montant total recalculé.
- Si une facture a déjà été payée (statut `paid`) :
  - Ne jamais modifier la facture existante.
  - Comparer le nouveau montant total avec le montant déjà payé pour déduire le reste à payer.
  - Créer une nouvelle facture complémentaire (une invoice à l'état `init`) pour ce reste à payer.

## Restitution des données pour le Frontend (Détails de la commande)
- Renvoyer des informations financières claires : le montant déjà payé, le nouveau total global, et le reste à payer.
- Détecter si une facture est à l'état `init` et renvoyer une information permettant d'afficher "Paiement en attente" et le bouton d'action "Faire payer le client".

## Modélisation stricte des Statuts
- Les statuts possibles pour une Commande sont : `pending`, `processing`, `completed`, et `cancelled`.
- Les statuts possibles pour une Invoice (Facture) sont : `init`, `paid`, `failed`, et `cancelled`.

# 3. Diagramme UML
Se rendre dans `../resource` pour voire les diagramme pur la partie conception

## 4. Demarrage technique (TypeScript + Prisma)

### Pre-requis
- Node.js 20+
- PostgreSQL v17 local actif
- Prisma v6.x.x

### Installation
```bash
npm install
npm run prisma:generate
```

### Lancer le projet
```bash
npm run dev
```

### Compiler en production
```bash
npm run build
npm start
```

### Prisma
```bash
npm run prisma:migrate
npm run prisma:studio
```
