/**
 * Logique métier pour l'inscription, la connexion et la génération de tokens JWT.
 */

import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev';

export const authService = {

    // 1. Inscription d'un nouvel utilisateur
    async register(email: string, motDePasse: string, role: Role) {
        // Vérifier si l'utilisateur existe déjà
        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) {
            throw new Error("Cet email est déjà utilisé.");
        }

        // Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(motDePasse, 10);

        // Créer l'utilisateur en base
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role
            }
        });

        // On ne renvoie pas le mot de passe dans la réponse
        const { password, ...userSansMotDePasse } = newUser;
        return userSansMotDePasse;
    },

    // 2. Connexion et génération du token JWT
    async login(email: string, motDePasse: string) {
        // Chercher l'utilisateur
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error("Identifiants incorrects.");
        }

        // Vérifier que le mot de passe correspond au hash en base
        const isPasswordValid = await bcrypt.compare(motDePasse, user.password);
        if (!isPasswordValid) {
            throw new Error("Identifiants incorrects.");
        }

        // Générer le token JWT valide pour 24 heures
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return {
            token,
            user: { id: user.id, email: user.email, role: user.role }
        };
    }
};