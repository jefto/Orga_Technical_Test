/**
 * Contrôleur pour les routes d'inscription et de connexion.
 */

import { Request, Response } from 'express';
import { authService } from '../services/auth.service';

export const authController = {

    async register(req: Request, res: Response) {
        try {
            const { email, password, role } = req.body;

            if (!email || !password || !role) {
                return res.status(400).json({ success: false, message: "L'email, le mot de passe et le rôle sont requis." });
            }

            const user = await authService.register(email, password, role);
            return res.status(201).json({ success: true, message: "Inscription réussie", data: user });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message });
        }
    },

    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ success: false, message: "L'email et le mot de passe sont requis." });
            }

            const result = await authService.login(email, password);
            return res.status(200).json({ success: true, message: "Connexion réussie", data: result });
        } catch (error: any) {
            return res.status(401).json({ success: false, message: error.message });
        }
    }
};