import { Router } from "express";
import { prisma } from "../prisma";
import { AppError } from "../errors/AppError";
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: string;
      };
    }
  }
}

const router = Router();
/**
 * @swagger
 * /api/auditLogs:
 *   get:
 *     summary: Get audit logs (admin only)
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of audit logs
 */
function requireAdmin(role: string) {
  if (role !== "admin") {
    throw new AppError("Forbidden", 403);
  }
}

// =======================
// LIST AUDIT LOG (READ-ONLY)
// =======================
router.get("/", async (req, res) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  requireAdmin(req.user.role);

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
