import { Router } from "express";
import { prisma } from "../prisma";
import { AppError } from "../errors/AppError";
import { assertRecordEditable } from "../services/medicalRecord.service";
import { AuditAction } from "@prisma/client";
import { logAudit } from "../utils/audit";

const router = Router();

// =======================
// UPDATE NURSING DATA
// =======================
router.patch("/:id/nursing", async (req, res) => {
  const recordId = Number(req.params.id);
  if (isNaN(recordId)) {
    throw new AppError("Invalid record id", 400);
  }

  const { subjective, nursingPlan = null } = req.body;

  if (!subjective || typeof subjective !== "string") {
    throw new AppError("subjective is required", 400);
  }

  await assertRecordEditable(recordId);

  await prisma.medicalRecord.update({
    where: { id: recordId },
    data: { subjective, nursingPlan },
  });

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
});

// =======================
// FINALIZE RECORD
// =======================
router.patch("/:id/finalize", async (req, res) => {
  const recordId = Number(req.params.id);
  if (isNaN(recordId)) {
    throw new AppError("Invalid record id", 400);
  }

  // 🔒 CEK STATUS DULU (DOMAIN RULE)
  await assertRecordEditable(recordId);

  const {
    objective,
    assessment,
    pharmacologyPlan,
    nonPharmacologyPlan,
  } = req.body || {};

  // 📋 VALIDASI ISI SOAP
  if (!objective || !assessment) {
    throw new AppError("objective and assessment are required", 400);
  }

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
});


// =======================
// LIST RECORDS BY PATIENT
// =======================
router.get("/patient/:patientId", async (req, res) => {
  const patientId = Number(req.params.patientId);
  if (isNaN(patientId)) {
    throw new AppError("Invalid patient id", 400);
  }

  const records = await prisma.medicalRecord.findMany({
    where: { patientId },
    orderBy: { visitDate: "desc" },
  });

  res.json({ success: true, data: records });
});

// =======================
// GET RECORD BY ID
// =======================
router.get("/:id", async (req, res) => {
  const recordId = Number(req.params.id);
  if (isNaN(recordId)) {
    throw new AppError("Invalid record id", 400);
  }

  const record = await prisma.medicalRecord.findUnique({
    where: { id: recordId },
  });

  if (!record) {
    throw new AppError("Medical record not found", 404);
  }

  res.json({ success: true, data: record });
});

export default router;
