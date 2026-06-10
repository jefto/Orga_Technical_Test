import type { Request, Response } from "express";

import { prisma } from "../lib/prisma";

export const healthController = {
  async check(_req: Request, res: Response): Promise<void> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({ status: "ok", database: "connected" });
    } catch {
      res.status(503).json({ status: "Inactif", database: "disconnected" });
    }
  }
};

