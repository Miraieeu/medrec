import { Router } from "express";
import { prisma } from "../prisma";
import { requireRole } from "../middleware/requireRole";
import { AppError } from "../errors/AppError";
import { assertRecordEditable } from "../services/medicalRecord.service";

const router = Router();

// =======================
// UPDATE NURSING DATA (NURSE)
// =======================
router.patch(
  "/:id/nursing",
  requireRole(["nurse"]),
  async (req, res) => {
    const recordId = Number(req.params.id);
    if (isNaN(recordId)) {
      throw new AppError("Invalid record id", 400);
    }

    const { subjective, objective, assessment, nursingPlan } = req.body;

    if (!subjective && !objective && !assessment && !nursingPlan) {
      throw new AppError("No nursing data provided", 400);
    }

    // 🔒 pastikan masih editable (DRAFT)
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

    res.json({
      success: true,
      message: "Nursing data updated",
      recordId,
    });
  }
);

// =======================
// FINALIZE RECORD (DOCTOR)
// =======================
router.patch(
  "/:id/finalize",
  requireRole(["doctor"]),
  async (req, res) => {
    const recordId = Number(req.params.id);
    if (isNaN(recordId)) {
      throw new AppError("Invalid record id", 400);
    }

    const { pharmacologyPlan, nonPharmacologyPlan } = req.body || {};

    if (!pharmacologyPlan && !nonPharmacologyPlan) {
      throw new AppError(
        "pharmacologyPlan or nonPharmacologyPlan is required",
        400
      );
    }

    // 🔒 helper cek:
    // - record ada
    // - status masih DRAFT
    await assertRecordEditable(recordId);

    await prisma.medicalRecord.update({
      where: { id: recordId },
      data: {
        pharmacologyPlan,
        nonPharmacologyPlan,
        status: "FINAL",
        doctorId: req.user!.id,
      },
    });

    res.json({
      success: true,
      message: "Medical record finalized",
      recordId,
    });
  }
);

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
    include: {
      doctor: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({
    success: true,
    data: records,
  });
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
    include: {
      patient: true,
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
});

export default router;
