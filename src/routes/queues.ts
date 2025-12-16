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
// CREATE QUEUE (REGISTRATION)
// =======================
router.post("/", async (req, res) => {
  try {
    requireRole(req.user.role, ["registration"]);

    const { patientId } = req.body;
    if (!patientId) {
      return res.status(400).json({ error: "patientId is required" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const last = await prisma.queue.findFirst({
      where: { date: today },
      orderBy: { number: "desc" },
    });

    const number = last ? last.number + 1 : 1;

    const queue = await prisma.queue.create({
      data: {
        patientId,
        number,
        date: today,
        createdById: req.user.id,
      },
    });

    res.json(queue);
  } catch (err) {
    res.status(403).json({ error: (err as Error).message });
  }
});

// =======================
// LIST TODAY QUEUE (STATIC)
// =======================
router.get("/today", async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const queues = await prisma.queue.findMany({
    where: { date: today },
    include: {
      patient: true,
      createdBy: {
        select: { id: true, name: true, role: true },
      },
    },
    orderBy: { number: "asc" },
  });

  res.json(queues);
});

// =======================
// CALL QUEUE (NURSE)
// =======================
router.patch("/:id/call", async (req, res) => {
  try {
    requireRole(req.user.role, ["nurse"]);

    const queueId = Number(req.params.id);
    if (isNaN(queueId)) {
      return res.status(400).json({ error: "Invalid queue id" });
    }

    const queue = await prisma.queue.findUnique({ where: { id: queueId } });
    if (!queue) {
      return res.status(404).json({ error: "Queue not found" });
    }

    if (queue.status !== "WAITING") {
      return res.status(400).json({ error: "Queue is not in WAITING state" });
    }

    await prisma.queue.update({
      where: { id: queueId },
      data: { status: "CALLED" },
    });

    const record = await prisma.medicalRecord.create({
      data: {
        patientId: queue.patientId,
        doctorId: null,
        subjective: "",
        objective: "",
        assessment: "",
        nursingPlan: "",
        status: "DRAFT",
      },
    });

    res.json({
      message: "Queue called",
      queueId: queue.id,
      medicalRecordId: record.id,
    });
  } catch (err) {
    res.status(403).json({ error: (err as Error).message });
  }
});

// =======================
// DONE QUEUE (DOCTOR)
// =======================
router.patch("/:id/done", async (req, res) => {
  try {
    requireRole(req.user.role, ["doctor"]);

    const queueId = Number(req.params.id);
    if (isNaN(queueId)) {
      return res.status(400).json({ error: "Invalid queue id" });
    }

    const queue = await prisma.queue.findUnique({ where: { id: queueId } });
    if (!queue) {
      return res.status(404).json({ error: "Queue not found" });
    }

    if (queue.status !== "CALLED") {
      return res.status(400).json({ error: "Queue is not in CALLED state" });
    }

    await prisma.queue.update({
      where: { id: queueId },
      data: { status: "DONE" },
    });

    const updated = await prisma.medicalRecord.updateMany({
      where: {
        patientId: queue.patientId,
        status: "DRAFT",
        doctorId: null,
      },
      data: {
        doctorId: req.user.id,
      },
    });

    if (updated.count === 0) {
      return res
        .status(400)
        .json({ error: "No active medical record found" });
    }

    res.json({
      message: "Queue completed",
      queueId: queue.id,
    });
  } catch (err) {
    res.status(403).json({ error: (err as Error).message });
  }
});

// =======================
// GET QUEUE BY ID (DYNAMIC)
// =======================
router.get("/:id", async (req, res) => {
  const queueId = Number(req.params.id);
  if (isNaN(queueId)) {
    return res.status(400).json({ error: "Invalid queue id" });
  }

  const queue = await prisma.queue.findUnique({
    where: { id: queueId },
    include: { patient: true },
  });

  if (!queue) {
    return res.status(404).json({ error: "Queue not found" });
  }

  res.json(queue);
});

// ✅ EXPORT PALING BAWAH
export default router;
