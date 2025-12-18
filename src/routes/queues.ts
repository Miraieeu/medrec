import { Router } from "express";
import { prisma } from "../prisma";
import { requireRole } from "../middleware/requireRole";
//import { authFromNextAuth } from "../middleware/authFromNextAuth";
import { logAudit } from "../utils/audit";
import { AuditAction } from "@prisma/client";
import { AppError } from "../errors/AppError";
import { authJWT } from "../middleware/authJWT";

const router = Router();
// =======================
// CREATE QUEUE (REGISTRATION)
// =======================
router.post(
  "/",
  authJWT,
  requireRole(["registration"]),
  async (req, res) => {
    const { mrNumber } = req.body;

    console.log("🔥 NEW QUEUE ROUTE ACTIVE 🔥");
    console.log("BODY =", req.body);

    if (!mrNumber || typeof mrNumber !== "string") {
      throw new AppError("mrNumber is required", 400);
    }

    const patient = await prisma.patient.findUnique({
      where: { medicalRecordNumber: mrNumber },
    });

    if (!patient) {
      throw new AppError("Patient not found", 404);
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
        patientId: patient.id,
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
// LIST TODAY QUEUE (PUBLIC INTERNAL)
// =======================
router.get(
  "/today",
  authJWT,
  requireRole(["registration", "nurse", "doctor"]),
  async (_req, res) => {
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
  }
);


// =======================
// CALL QUEUE (NURSE)
// =======================
router.patch(
  "/:id/call",
  authJWT,
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
  authJWT,
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
router.get(
  "/:id",
  authJWT,
  requireRole(["registration", "nurse", "doctor"]),
  async (req, res) => {
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
  }
);


// =======================
// SUMMARY TODAY
// =======================
router.get(
  "/summary/today",
  authJWT,
  requireRole(["admin", "registration", "nurse", "doctor"]),
  async (_req, res) => {
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
  }
);


export default router;
