# 1. Reformulation du besoin (Le cœur du problème)

Actuellement, dès qu'une commande est validée, elle est considérée coAmme terminée et figée.
L'objectif de cette évolution est de la rendre dynamique. Tant qu'une commande n'est pas
clôturée définitivement (statut différent de `completed`), le client ou le serveur doit
pouvoir la rouvrir, ajouter des plats et modifier les quantités.

Le vrai défi technique de ce test réside dans la gestion de la facturation : il faut savoir
manipuler les statuts des paiements, en particulier pour le Mobile Money, afin de gérer
les factures impayées ou les compléments à payer sans jamais écraser la trace d'un paiement
déjà effectué.

# 2. Liste des attentes et fonctionnalités à mettre en place

Voici exactement ce que l'API devra être capable de faire :

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

# 4. Demarrage technique (TypeScript + Prisma)

## Pre-requis
- Node.js 20+
- PostgreSQL v17 local actif
- Prisma v6.x.x

## Installation
```bash
npm install
npm run prisma:generate
```

## Lancer le projet
```bash
npm run dev
```

## Compiler en production
```bash
npm run build
npm start
```

## Prisma
```bash
npm run prisma:migrate
npm run prisma:studio
```

# 5. Documentation API (Modèles, Énumérations, Endpoints)

## Modèles Prisma

### User
Gère les comptes applicatifs (authentification, identité et rôle d'accès).
- `id` (Int, PK, auto-incrément)
- `email` (String, unique)
- `password` (String, hashé)
- `role` (Role)
- `orders` (relation 1-n vers `Order`)

### Order
Représente la commande principale d'un client, son statut global et son total financier.
- `id` (Int, PK, auto-incrément)
- `montantTotal` (Float)
- `methodePaiement` (PaymentMethod)
- `statut` (OrderStatus)
- `dateCreation` (DateTime)
- `dateModification` (DateTime)
- `userId` (Int?, FK vers `User`)
- Relations: `articles`, `factures`, `historiques`

### OrderItem
Stocke chaque ligne de panier (plat, quantité, prix unitaire et sous-total).
- `id` (Int, PK, auto-incrément)
- `nomMenu` (String)
- `prixUnitaire` (Float)
- `sousTotal` (Float)
- `quantite` (Int)
- `orderId` (Int, FK vers `Order`)

### Invoice
Trace les factures émises pour une commande et leur état de paiement.
- `id` (Int, PK, auto-incrément)
- `montant` (Float)
- `statut` (InvoiceStatus)
- `dateCreation` (DateTime)
- `dateModification` (DateTime)
- `orderId` (Int, FK vers `Order`)
- Relation: `transactions`

### PaymentTransaction
Journalise chaque transaction de paiement liée à une facture (référence et montant encaissé).
- `id` (Int, PK, auto-incrément)
- `reference` (String, unique)
- `montant` (Float)
- `datePaiement` (DateTime)
- `statut` (InvoiceStatus)
- `invoiceId` (Int, FK vers `Invoice`)

### OrderHistory
Conserve l'historique métier des changements effectués sur une commande.
- `id` (Int, PK, auto-incrément)
- `action` (String)
- `ancienneValeur` (String)
- `nouvelleValeur` (String)
- `dateAction` (DateTime)
- `orderId` (Int, FK vers `Order`)

## Énumérations
- `OrderStatus`: `PENDING`, `PROCESSING`, `COMPLETED`, `CANCELLED`
- `InvoiceStatus`: `INIT`, `PAID`, `FAILED`, `CANCELLED`
- `PaymentMethod`: `CASH`, `MOBILE_MONEY`
- `Role`: `CLIENT`, `BOUTIQUIER`

## Endpoints

### Auth
- `POST /api/auth/register` (public) : crée un compte utilisateur avec un rôle (`CLIENT` ou `BOUTIQUIER`).
- `POST /api/auth/login` (public) : authentifie l'utilisateur et retourne un token JWT.

### Orders
- `POST /api/orders` (CLIENT) : crée une nouvelle commande vide liée au client connecté.
- `GET /api/orders` (BOUTIQUIER) : récupère la liste globale des commandes.
- `POST /api/orders/{orderId}/items` (CLIENT) : ajoute un article (plat) à une commande ouverte.
- `GET /api/orders/{orderId}` (CLIENT, BOUTIQUIER) : renvoie le détail d'une commande et son résumé financier.

### Payments
- `POST /api/orders/{orderId}/pay` (CLIENT) : enregistre un paiement (partiel ou total) pour une commande.
- `PUT /api/orders/{orderId}/complete` (BOUTIQUIER) : verrouille définitivement la commande (statut `COMPLETED`).
- `GET /api/orders/{orderId}/payments` (BOUTIQUIER) : consulte l'historique des transactions de paiement d'une commande.

## Documentation Swagger
- Local: `http://localhost:[.env.PORT]/api-docs`
- Production (Render): `https://orga-technical-test.onrender.com/api-docs`
