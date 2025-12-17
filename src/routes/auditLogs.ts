import { Router } from "express";
import { prisma } from "../prisma";

declare global {
  namespace Express {
    interface Request {
      user: {
        id: number;
        role: string;
      };
    }
  }
}

const router = Router();

function requireAdmin(role: string) {
  if (role !== "admin") {
    throw new Error("Forbidden");
  }
}

// =======================
// LIST AUDIT LOG (READ-ONLY)
// =======================
router.get("/", async (req, res) => {
  try {
    requireAdmin(req.user.role); // 🔐 admin only (opsional tapi direkomendasikan)

    const logs = await prisma.auditLog.findMany({
      include: {
        user: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(logs);
  } catch (err) {
    res.status(403).json({ error: (err as Error).message });
  }
});

export default router;
