/**
 * Intercepte les requêtes pour valider le token JWT et vérifier les rôles.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev';

// On étend l'interface Request d'Express pour que TypeScript accepte 'req.user'
export interface AuthRequest extends Request {
    user?: any;
}

// 1. Vérification de la validité du Token
export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: "Accès refusé. Token manquant." });
    }

    const token = authHeader.split(' ')[1]; // On récupère la partie après "Bearer "

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Token invalide ou expiré." });
    }
};

// 2. Vérification du Rôle (RBAC - Role Based Access Control)
export const requireRole = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Accès interdit. Réservé aux rôles : ${roles.join(', ')}`
            });
        }
        next();
    };
};