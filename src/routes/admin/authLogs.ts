// src/routes/admin/authLogs.ts
import { Router } from "express";
import { prisma } from "../../prisma";

const router = Router();

/**
 * GET /api/admin/auth-logs
 * Login / Logout / Failed login
 */
router.get("/", async (_req, res) => {
  const logs = await prisma.authLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
  });

  res.json({
    success: true,
    data: logs,
  });
});

export default router;
