import { Router } from "express";
import { prisma } from "../prisma";
import { requireRole } from "../middleware/requireRole";
import { AppError } from "../errors/AppError";
import { assertRecordEditable } from "../services/medicalRecord.service";
import { authJWT } from "../middleware/authJWT";
import { AuditAction } from "@prisma/client";
import { logAudit } from "../utils/audit";

const router = Router();

// =======================
// UPDATE NURSING DATA (NURSE)
// =======================
router.patch(
  "/:id/nursing",
  authJWT,
  requireRole(["nurse"]),
  async (req, res) => {
    const recordId = Number(req.params.id);
    if (isNaN(recordId)) {
      throw new AppError("Invalid record id", 400);
    }

    const { subjective, nursingPlan = null } = req.body;

    if (!subjective || typeof subjective !== "string") {
      throw new AppError("subjective is required", 400);
    }

    // 🔒 Pastikan masih editable (DRAFT)
    await assertRecordEditable(recordId);

    await prisma.medicalRecord.update({
      where: { id: recordId },
      data: {
        subjective,
        nursingPlan,
      },
    });

    // 📝 AUDIT LOG
    await logAudit({
      userId: req.user!.id,
      action: AuditAction.UPDATE_NURSING,
      entity: "MedicalRecord",
      entityId: recordId,
    });

    res.json({
      success: true,
      message: "Nursing SOAP updated",
      recordId,
    });
  }
);

// =======================
// FINALIZE RECORD (DOCTOR)
// =======================
router.patch(
  "/:id/finalize",
  authJWT,
  requireRole(["doctor"]),
  async (req, res) => {
    const recordId = Number(req.params.id);
    if (isNaN(recordId)) {
      throw new AppError("Invalid record id", 400);
    }

    const {
      objective,
      assessment,
      pharmacologyPlan,
      nonPharmacologyPlan,
    } = req.body || {};

    if (!objective || !assessment) {
      throw new AppError("objective and assessment are required", 400);
    }

    await assertRecordEditable(recordId);

    await prisma.medicalRecord.update({
      where: { id: recordId },
      data: {
        objective,
        assessment,
        pharmacologyPlan,
        nonPharmacologyPlan,
        status: "FINAL",
        doctorId: req.user!.id,
      },
    });

    // 📝 AUDIT LOG
    await logAudit({
      userId: req.user!.id,
      action: AuditAction.FINALIZE_RECORD,
      entity: "MedicalRecord",
      entityId: recordId,
    });

    res.json({
      success: true,
      message: "Medical record finalized",
      recordId,
    });
  }
);

// =======================
// LIST RECORDS BY PATIENT (READ ONLY)
// =======================
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
      select: {
        id: true,
        visitDate: true,
        status: true,
        subjective: true,
        objective: true,
        assessment: true,
        nursingPlan: true,
        pharmacologyPlan: true,
        nonPharmacologyPlan: true,
        doctor: {
          select: { id: true, name: true },
        },
      },
      orderBy: { visitDate: "desc" },
    });

    res.json({
      success: true,
      data: records,
    });
  }
);

// =======================
// GET RECORD BY ID (READ ONLY)
// =======================
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
      select: {
        id: true,
        visitDate: true,
        status: true,
        subjective: true,
        objective: true,
        assessment: true,
        nursingPlan: true,
        pharmacologyPlan: true,
        nonPharmacologyPlan: true,
        patient: {
          select: {
            id: true,
            name: true,
            medicalRecordNumber: true,
            dob: true,
          },
        },
        doctor: {
          select: { id: true, name: true },
        },
      },
    });

    if (!record) {
      throw new AppError("Medical record not found", 404);
    }

    res.json({
      success: true,
      data: record,
    });
  }
);

export default router;
