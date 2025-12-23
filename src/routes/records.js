"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../prisma");
const AppError_1 = require("../errors/AppError");
const medicalRecord_service_1 = require("../services/medicalRecord.service");
const client_1 = require("@prisma/client");
const audit_1 = require("../utils/audit");
const authJWT_1 = require("../middleware/authJWT");
const requireRole_1 = require("../middleware/requireRole");
const router = (0, express_1.Router)();
/**
 * ======================================================
 * GET RECORDS BY NIK (NURSE / DOCTOR)
 * ======================================================
 * GET /api/nurse/records/by-nik/:nik
 */
router.get("/by-nik/:nik", authJWT_1.authJWT, (0, requireRole_1.requireRole)(["nurse", "doctor"]), async (req, res) => {
    const nik = String(req.params.nik || "").trim();
    if (!/^\d{16}$/.test(nik)) {
        throw new AppError_1.AppError("Invalid NIK format", 400);
    }
    // 🔐 HASH NIK (HARUS IDENTIK DENGAN patients.ts)
    const nikHash = crypto_1.default
        .createHash("sha256")
        .update(nik)
        .digest("hex");
    const patient = await prisma_1.prisma.patient.findUnique({
        where: { nikHash },
        select: {
            id: true,
            name: true,
            medicalRecordNumber: true,
        },
    });
    if (!patient) {
        throw new AppError_1.AppError("Patient not found", 404);
    }
    const records = await prisma_1.prisma.medicalRecord.findMany({
        where: { patientId: patient.id },
        orderBy: { visitDate: "desc" },
    });
    res.json({
        success: true,
        data: {
            patient,
            records,
        },
    });
});
/**
 * ======================================================
 * UPDATE NURSING SOAP (NURSE)
 * ======================================================
 * PATCH /api/records/:id/nursing
 */
router.patch("/:id/nursing", authJWT_1.authJWT, (0, requireRole_1.requireRole)(["nurse"]), async (req, res) => {
    const recordId = Number(req.params.id);
    if (isNaN(recordId)) {
        throw new AppError_1.AppError("Invalid record id", 400);
    }
    const { subjective, objective, assessment, nursingPlan = null, } = req.body;
    if (!subjective || !objective) {
        throw new AppError_1.AppError("subjective & objective are required", 400);
    }
    await (0, medicalRecord_service_1.assertRecordEditable)(recordId);
    await prisma_1.prisma.medicalRecord.update({
        where: { id: recordId },
        data: {
            subjective,
            objective,
            assessment,
            nursingPlan,
        },
    });
    await (0, audit_1.logAudit)({
        userId: req.user.id,
        action: client_1.AuditAction.UPDATE_NURSING,
        entity: "MedicalRecord",
        entityId: recordId,
    });
    res.json({
        success: true,
        message: "Nursing SOAP saved (draft)",
        recordId,
    });
});
/**
 * ======================================================
 * FINALIZE RECORD (DOCTOR)
 * ======================================================
 * PATCH /api/records/:id/finalize
 */
router.patch("/:id/finalize", authJWT_1.authJWT, (0, requireRole_1.requireRole)(["doctor"]), async (req, res) => {
    const recordId = Number(req.params.id);
    if (isNaN(recordId)) {
        throw new AppError_1.AppError("Invalid record id", 400);
    }
    await (0, medicalRecord_service_1.assertRecordEditable)(recordId);
    const { objective, subjective, assessment, pharmacologyPlan, nonPharmacologyPlan, } = req.body || {};
    if (!objective || !assessment) {
        throw new AppError_1.AppError("objective and assessment are required", 400);
    }
    // 🔍 Ambil record + queue
    const record = await prisma_1.prisma.medicalRecord.findUnique({
        where: { id: recordId },
        include: {
            patient: true,
        },
    });
    if (!record) {
        throw new AppError_1.AppError("Medical record not found", 404);
    }
    // 🔍 Cari queue aktif pasien hari ini
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const queue = await prisma_1.prisma.queue.findFirst({
        where: {
            patientId: record.patientId,
            status: "CALLED",
            date: {
                gte: todayStart,
                lte: todayEnd,
            },
        },
    });
    if (!queue) {
        throw new AppError_1.AppError("Active queue not found", 404);
    }
    // 🔒 TRANSACTION
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.medicalRecord.update({
            where: { id: recordId },
            data: {
                objective,
                assessment,
                pharmacologyPlan,
                nonPharmacologyPlan,
                status: "FINAL",
                doctorId: req.user.id,
            },
        }),
        prisma_1.prisma.queue.update({
            where: { id: queue.id },
            data: { status: "DONE" },
        }),
    ]);
    await (0, audit_1.logAudit)({
        userId: req.user.id,
        action: client_1.AuditAction.FINALIZE_RECORD,
        entity: "MedicalRecord",
        entityId: recordId,
    });
    res.json({
        success: true,
        message: "SOAP finalized & queue completed",
        recordId,
        queueId: queue.id,
    });
});
/**
 * ======================================================
 * LIST RECORDS BY PATIENT ID
 * ======================================================
 * GET /api/records/patient/:patientId
 */
router.get("/patient/:patientId", authJWT_1.authJWT, (0, requireRole_1.requireRole)(["nurse", "doctor"]), async (req, res) => {
    const patientId = Number(req.params.patientId);
    if (isNaN(patientId)) {
        throw new AppError_1.AppError("Invalid patient id", 400);
    }
    const records = await prisma_1.prisma.medicalRecord.findMany({
        where: { patientId },
        orderBy: { visitDate: "desc" },
    });
    res.json({ success: true, data: records });
});
/**
 * ======================================================
 * GET RECORD BY ID
 * ======================================================
 * GET /api/records/:id
 */
router.get("/:id", authJWT_1.authJWT, (0, requireRole_1.requireRole)(["nurse", "doctor"]), async (req, res) => {
    const recordId = Number(req.params.id);
    if (isNaN(recordId)) {
        throw new AppError_1.AppError("Invalid record id", 400);
    }
    const record = await prisma_1.prisma.medicalRecord.findUnique({
        where: { id: recordId },
        include: {
            patient: {
                select: {
                    name: true,
                    medicalRecordNumber: true,
                },
            },
        },
    });
    if (!record) {
        throw new AppError_1.AppError("Medical record not found", 404);
    }
    res.json({ success: true, data: record });
});
exports.default = router;
