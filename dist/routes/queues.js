"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const requireRole_1 = require("../middleware/requireRole");
const audit_1 = require("../utils/audit");
const client_1 = require("@prisma/client");
const AppError_1 = require("../errors/AppError");
const authJWT_1 = require("../middleware/authJWT");
const router = (0, express_1.Router)();
/**
 * Helper: waktu hari ini (00:00 – 23:59)
 */
function getTodayRange() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
}
/**
 * Helper: tanggal queue (selalu 00:00)
 */
function getQueueDate() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}
// =======================
// CREATE QUEUE (REGISTRATION)
// =======================
router.post("/", authJWT_1.authJWT, (0, requireRole_1.requireRole)(["registration"]), async (req, res) => {
    const { patientId } = req.body;
    if (!patientId || typeof patientId !== "number") {
        throw new AppError_1.AppError("patientId is required", 400);
    }
    const patient = await prisma_1.prisma.patient.findUnique({
        where: { id: patientId },
    });
    if (!patient) {
        throw new AppError_1.AppError("Patient not found", 404);
    }
    const { start, end } = getTodayRange();
    const queueDate = getQueueDate();
    // ❗ Cegah pasien masuk antrian dua kali di hari yang sama
    const exists = await prisma_1.prisma.queue.findFirst({
        where: {
            patientId,
            date: {
                gte: start,
                lte: end,
            },
        },
    });
    if (exists) {
        throw new AppError_1.AppError("Patient already in queue today", 409);
    }
    // cari nomor terakhir hari ini
    const last = await prisma_1.prisma.queue.findFirst({
        where: {
            date: {
                gte: start,
                lte: end,
            },
        },
        orderBy: { number: "desc" },
    });
    const number = last ? last.number + 1 : 1;
    const queue = await prisma_1.prisma.queue.create({
        data: {
            number,
            date: queueDate,
            patientId: patient.id,
            createdById: req.user.id,
        },
    });
    await (0, audit_1.logAudit)({
        userId: req.user.id,
        action: client_1.AuditAction.CREATE_QUEUE,
        entity: "Queue",
        entityId: queue.id,
    });
    res.status(201).json({
        success: true,
        data: queue,
    });
});
// =======================
// LIST TODAY QUEUE
// =======================
router.get("/today", authJWT_1.authJWT, (0, requireRole_1.requireRole)(["registration", "nurse", "doctor"]), async (_req, res) => {
    const { start, end } = getTodayRange();
    const queues = await prisma_1.prisma.queue.findMany({
        where: {
            date: {
                gte: start,
                lte: end,
            },
        },
        include: {
            patient: {
                include: {
                    records: {
                        where: { status: "DRAFT" },
                        orderBy: { createdAt: "desc" },
                        take: 1,
                    },
                },
            },
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
router.patch("/:id/call", authJWT_1.authJWT, (0, requireRole_1.requireRole)(["registration"]), async (req, res) => {
    const queueId = Number(req.params.id);
    const queue = await prisma_1.prisma.queue.findUnique({
        where: { id: queueId },
    });
    if (!queue)
        throw new AppError_1.AppError("Queue not found", 404);
    if (queue.status !== "WAITING") {
        throw new AppError_1.AppError("Queue is not in WAITING state", 400);
    }
    await prisma_1.prisma.queue.update({
        where: { id: queueId },
        data: { status: "CALLED" },
    });
    const record = await prisma_1.prisma.medicalRecord.create({
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
    await (0, audit_1.logAudit)({
        userId: req.user.id,
        action: client_1.AuditAction.CALL_QUEUE,
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
});
// =======================
// DONE QUEUE (DOCTOR)
// =======================
router.patch("/:id/done", authJWT_1.authJWT, (0, requireRole_1.requireRole)(["doctor"]), async (req, res) => {
    const queueId = Number(req.params.id);
    if (isNaN(queueId)) {
        throw new AppError_1.AppError("Invalid queue id", 400);
    }
    const queue = await prisma_1.prisma.queue.findUnique({
        where: { id: queueId },
    });
    if (!queue)
        throw new AppError_1.AppError("Queue not found", 404);
    if (queue.status !== "CALLED") {
        throw new AppError_1.AppError("Queue is not in CALLED state", 400);
    }
    await prisma_1.prisma.queue.update({
        where: { id: queueId },
        data: { status: "DONE" },
    });
    const updated = await prisma_1.prisma.medicalRecord.updateMany({
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
        throw new AppError_1.AppError("No active medical record found", 400);
    }
    await (0, audit_1.logAudit)({
        userId: req.user.id,
        action: client_1.AuditAction.DONE_QUEUE,
        entity: "Queue",
        entityId: queueId,
    });
    res.json({
        success: true,
        data: { queueId },
    });
});
// =======================
// GET QUEUE BY ID
// =======================
router.get("/:id", authJWT_1.authJWT, (0, requireRole_1.requireRole)(["registration", "nurse", "doctor"]), async (req, res) => {
    const queueId = Number(req.params.id);
    if (isNaN(queueId)) {
        throw new AppError_1.AppError("Invalid queue id", 400);
    }
    const queue = await prisma_1.prisma.queue.findUnique({
        where: { id: queueId },
        include: { patient: true },
    });
    if (!queue)
        throw new AppError_1.AppError("Queue not found", 404);
    res.json({
        success: true,
        data: queue,
    });
});
// =======================
// SUMMARY TODAY
// =======================
router.get("/summary/today", async (_req, res) => {
    const { start, end } = getTodayRange();
    const [waiting, called, done] = await Promise.all([
        prisma_1.prisma.queue.count({
            where: { date: { gte: start, lte: end }, status: "WAITING" },
        }),
        prisma_1.prisma.queue.count({
            where: { date: { gte: start, lte: end }, status: "CALLED" },
        }),
        prisma_1.prisma.queue.count({
            where: { date: { gte: start, lte: end }, status: "DONE" },
        }),
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
exports.default = router;
