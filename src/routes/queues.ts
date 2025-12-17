import { Router } from "express";
import { prisma } from "../prisma";
import { requireRole } from "../middleware/requireRole";
import { logAudit } from "../utils/audit";
import { AuditAction } from "@prisma/client";
import { AppError } from "../errors/AppError";

const router = Router();

// =======================
// CREATE QUEUE (REGISTRATION)
// =======================
router.post(
  "/",
  requireRole(["registration"]),
  async (req, res) => {
    const { patientId } = req.body;

    if (!patientId) {
      throw new AppError("patientId is required", 400);
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
        createdById: req.user!.id,
      },
    });

    await logAudit({
      userId: req.user!.id,
      action: AuditAction.CREATE_QUEUE,
      entity: "Queue",
      entityId: queue.id,
    });

    res.status(201).json({
      success: true,
      data: queue,
    });
  }
);

// =======================
// LIST TODAY QUEUE
// =======================
router.get("/today", async (_req, res) => {
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

  res.json({
    success: true,
    data: queues,
  });
});

// =======================
// CALL QUEUE (NURSE)
// =======================
router.patch(
  "/:id/call",
  requireRole(["nurse"]),
  async (req, res) => {
    const queueId = Number(req.params.id);
    if (isNaN(queueId)) {
      throw new AppError("Invalid queue id", 400);
    }

    const queue = await prisma.queue.findUnique({
      where: { id: queueId },
    });

    if (!queue) {
      throw new AppError("Queue not found", 404);
    }

    if (queue.status !== "WAITING") {
      throw new AppError("Queue is not in WAITING state", 400);
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

    await logAudit({
      userId: req.user!.id,
      action: AuditAction.CALL_QUEUE,
      entity: "Queue",
      entityId: queueId,
    });

    res.json({
      success: true,
      data: {
        queueId,
        medicalRecordId: record.id,
      },
    });
  }
);

// =======================
// DONE QUEUE (DOCTOR)
// =======================
router.patch(
  "/:id/done",
  requireRole(["doctor"]),
  async (req, res) => {
    const queueId = Number(req.params.id);
    if (isNaN(queueId)) {
      throw new AppError("Invalid queue id", 400);
    }

    const queue = await prisma.queue.findUnique({
      where: { id: queueId },
    });

    if (!queue) {
      throw new AppError("Queue not found", 404);
    }

    if (queue.status !== "CALLED") {
      throw new AppError("Queue is not in CALLED state", 400);
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
        doctorId: req.user!.id,
      },
    });

    if (updated.count === 0) {
      throw new AppError("No active medical record found", 400);
    }

    await logAudit({
      userId: req.user!.id,
      action: AuditAction.DONE_QUEUE,
      entity: "Queue",
      entityId: queueId,
    });

    res.json({
      success: true,
      data: { queueId },
    });
  }
);

// =======================
// GET QUEUE BY ID
// =======================
router.get("/:id", async (req, res) => {
  const queueId = Number(req.params.id);
  if (isNaN(queueId)) {
    throw new AppError("Invalid queue id", 400);
  }

  const queue = await prisma.queue.findUnique({
    where: { id: queueId },
    include: { patient: true },
  });

  if (!queue) {
    throw new AppError("Queue not found", 404);
  }

  res.json({
    success: true,
    data: queue,
  });
});

// =======================
// SUMMARY TODAY
// =======================
router.get("/summary/today", async (_req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [waiting, called, done] = await Promise.all([
    prisma.queue.count({ where: { date: today, status: "WAITING" } }),
    prisma.queue.count({ where: { date: today, status: "CALLED" } }),
    prisma.queue.count({ where: { date: today, status: "DONE" } }),
  ]);

  res.json({
    success: true,
    data: {
      waiting,
      called,
      done,
      total: waiting + called + done,
    },
  });
});

// =======================
// NEXT QUEUE (UI HELPER)
// =======================
router.post("/next", async (_req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextQueue = await prisma.queue.findFirst({
    where: { date: today, status: "WAITING" },
    orderBy: { number: "asc" },
  });

  if (!nextQueue) {
    throw new AppError("No waiting queue", 404);
  }

  await prisma.queue.update({
    where: { id: nextQueue.id },
    data: { status: "CALLED" },
  });

  res.json({
    success: true,
    data: {
      queueId: nextQueue.id,
      number: nextQueue.number,
    },
  });
});

// =======================
// ACTIVE QUEUES (DRAFT RECORDS)
// =======================
router.get("/active", async (_req, res) => {
  const records = await prisma.medicalRecord.findMany({
    where: { status: "DRAFT" },
    include: {
      patient: true,
      doctor: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({
    success: true,
    data: records,
  });
});

export default router;
