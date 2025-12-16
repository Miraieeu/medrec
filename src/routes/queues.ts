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

function requireRole(role: string, allowed: string[]) {
  if (!allowed.includes(role)) {
    throw new Error("Forbidden");
  }
}

// =======================
// CREATE QUEUE
// =======================
router.post("/", async (req, res) => {
  try {
    res.json({ message: "Create queue endpoint" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/today", async (req, res) => {
  try {
    res.json({ message: "List today queue endpoint" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
// CALL QUEUE (NURSE)
// =======================
router.patch("/:id/call", async (req, res) => {
  try {
    res.json({ message: "Call queue endpoint" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// =======================
// DONE QUEUE (DOCTOR)
// =======================
router.patch("/:id/done", async (req, res) => {
  try {
    res.json({ message: "Done queue endpoint" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ EXPORT HARUS PALING BAWAH
export default router;
