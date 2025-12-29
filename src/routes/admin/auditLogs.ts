import { Router } from "express";
import { prisma } from "../../prisma";

const router = Router();

// GET /api/admin/audit-logs
router.get("/", async (_req, res) => {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
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
