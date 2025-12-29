import { Router } from "express";
import crypto from "crypto";
import { prisma } from "../prisma";
import { AppError } from "../errors/AppError";
import { assertRecordEditable } from "../services/medicalRecord.service";
import { AuditAction } from "@prisma/client";
import { logAudit } from "../utils/audit";
import { authJWT } from "../middleware/authJWT";
import { requireRole } from "../middleware/requireRole";

const router = Router();

/**
 * ======================================================
 * GET RECORDS BY NIK (NURSE / DOCTOR)
 * ======================================================
 * GET /api/nurse/records/by-nik/:nik
 */
router.get(
  "/by-nik/:nik",
  authJWT,
  requireRole(["nurse", "doctor"]),
  async (req, res) => {
    const nik = String(req.params.nik || "").trim();

    if (!/^\d{16}$/.test(nik)) {
      throw new AppError("Invalid NIK format", 400);
    }

    // 🔐 HASH NIK (HARUS IDENTIK DENGAN patients.ts)
    const nikHash = crypto
      .createHash("sha256")
      .update(nik)
      .digest("hex");

    const patient = await prisma.patient.findUnique({
      where: { nikHash },
      select: {
        id: true,
        name: true,
        medicalRecordNumber: true,
      },
    });

    if (!patient) {
      throw new AppError("Patient not found", 404);
    }

    const records = await prisma.medicalRecord.findMany({
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
  }
);

/**
 * ======================================================
 * UPDATE NURSING SOAP (NURSE)
 * ======================================================
 * PATCH /api/records/:id/nursing
 */
router.patch(
  "/:id/nursing",
  authJWT,
  requireRole(["nurse"]),
  async (req, res) => {
    const recordId = Number(req.params.id);
    if (isNaN(recordId)) {
      throw new AppError("Invalid record id", 400);
    }

    const {
      subjective,
      objective,
      assessment,
      nursingPlan = null,
    } = req.body;

    if (!subjective || !objective) {
      throw new AppError("subjective & objective are required", 400);
    }

    await assertRecordEditable(recordId);

    await prisma.medicalRecord.update({
      where: { id: recordId },
      data: {
        subjective,
        objective,
        assessment,
        nursingPlan,
      },
    });

    await logAudit({
      userId: req.user!.id,
      action: AuditAction.UPDATE_NURSING,
      entity: "MedicalRecord",
      entityId: recordId,
    });

    res.json({
      success: true,
      message: "Nursing SOAP saved (draft)",
      recordId,
    });
  }
);


/**
 * ======================================================
 * FINALIZE RECORD (DOCTOR)
 * ======================================================
 * PATCH /api/records/:id/finalize
 */
router.patch(
  "/:id/finalize",
  authJWT,
  requireRole(["doctor"]),
  async (req, res) => {
    const recordId = Number(req.params.id);
    if (isNaN(recordId)) {
      throw new AppError("Invalid record id", 400);
    }

    await assertRecordEditable(recordId);

    const {
      objective,
      subjective,
      assessment,
      pharmacologyPlan,
      nonPharmacologyPlan,
    } = req.body || {};

    if (!objective || !assessment) {
      throw new AppError("objective and assessment are required", 400);
    }

    // 🔍 Ambil record + queue
    const record = await prisma.medicalRecord.findUnique({
      where: { id: recordId },
      include: {
        patient: true,
      },
    });

    if (!record) {
      throw new AppError("Medical record not found", 404);
    }

    // 🔍 Cari queue aktif pasien hari ini
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const queue = await prisma.queue.findFirst({
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
      throw new AppError("Active queue not found", 404);
    }

    // 🔒 TRANSACTION
    await prisma.$transaction([
      prisma.medicalRecord.update({
        where: { id: recordId },
        data: {
          objective,
          assessment,
          pharmacologyPlan,
          nonPharmacologyPlan,
          status: "FINAL",
          doctorId: req.user!.id,
        },
      }),

      prisma.queue.update({
        where: { id: queue.id },
        data: { status: "DONE" },
      }),
    ]);

    await logAudit({
      userId: req.user!.id,
      action: AuditAction.FINALIZE_RECORD,
      entity: "MedicalRecord",
      entityId: recordId,
    });

    res.json({
      success: true,
      message: "SOAP finalized & queue completed",
      recordId,
      queueId: queue.id,
    });
  }
);


/**
 * ======================================================
 * LIST RECORDS BY PATIENT ID
 * ======================================================
 * GET /api/records/patient/:patientId
 */
router.get(
  "/patient/:patientId",
  authJWT,
  requireRole(["nurse", "doctor"]),
  async (req, res) => {
    const patientId = Number(req.params.patientId);
    if (isNaN(patientId)) {
      throw new AppError("Invalid patient id", 400);
    }

    const records = await prisma.medicalRecord.findMany({
      where: { patientId },
      orderBy: { visitDate: "desc" },
    });

    res.json({ success: true, data: records });
  }
);

/**
 * ======================================================
 * GET RECORD BY ID
 * ======================================================
 * GET /api/records/:id
 */
router.get(
  "/:id",
  authJWT,
  requireRole(["nurse", "doctor"]),
  async (req, res) => {
    const recordId = Number(req.params.id);
    if (isNaN(recordId)) {
      throw new AppError("Invalid record id", 400);
    }

    const record = await prisma.medicalRecord.findUnique({
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
      throw new AppError("Medical record not found", 404);
    }

    res.json({ success: true, data: record });
  }
);

export default router;
