import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

/**
 * @swagger
 * /api/auditLogs:
 *   get:
 *     summary: Get audit logs
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of audit logs
 */

// =======================
// LIST AUDIT LOG (READ-ONLY)
// =======================
router.get("/", async (_req, res) => {
  const logs = await prisma.auditLog.findMany({
    include: {
      user: {
        select: { id: true, name: true, role: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({
    success: true,
    data: logs,
  });
});

export default router;
