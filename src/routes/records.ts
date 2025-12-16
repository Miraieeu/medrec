import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

function requireRole(role: string, allowed: string[]) {
  if (!allowed.includes(role)) throw new Error("Forbidden");
}

import { assertRecordEditable } from "../services/medicalRecord.service";

router.patch("/:id/nursing", async (req, res) => {
  try {
    requireRole(req.user.role, ["nurse"]);

    const recordId = Number(req.params.id);
    if (isNaN(recordId)) {
      return res.status(400).json({ error: "Invalid record id" });
    }

    // 🔒 HELPER DIPAKAI DI SINI
    await assertRecordEditable(recordId);

    const { subjective, objective, assessment, nursingPlan } = req.body;

    await prisma.medicalRecord.update({
      where: { id: recordId },
      data: {
        subjective,
        objective,
        assessment,
        nursingPlan,
      },
    });

    res.json({ message: "Nursing data updated", recordId });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// =======================
// FINALIZE RECORD (DOCTOR)
// =======================
router.patch("/:id/finalize", async (req, res) => {
  try {
    requireRole(req.user.role, ["doctor"]);

    const recordId = Number(req.params.id);
    if (isNaN(recordId)) {
      return res.status(400).json({ error: "Invalid record id" });
    }

    const { pharmacologyPlan, nonPharmacologyPlan } = req.body || {};

    if (!pharmacologyPlan && !nonPharmacologyPlan) {
      return res.status(400).json({
        error: "pharmacologyPlan or nonPharmacologyPlan is required",
      });
    }

    const record = await assertRecordEditable(recordId);

    await prisma.medicalRecord.update({
      where: { id: recordId },
      data: {
        pharmacologyPlan,
        nonPharmacologyPlan,
        status: "FINAL",
        doctorId: req.user.id,
      },
    });

    res.json({ message: "Medical record finalized", recordId });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});


// =======================
// LIST RECORD BY PATIENT
// =======================
router.get("/patient/:patientId", async (req, res) => {
  const patientId = Number(req.params.patientId);

  const records = await prisma.medicalRecord.findMany({
    where: { patientId },
    include: {
      doctor: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(records);
});

// =======================
// GET RECORD BY ID
// =======================
router.get("/:id", async (req, res) => {
  const recordId = Number(req.params.id);

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
    return res.status(404).json({ error: "Medical record not found" });
  }

  res.json(record);
});

// =======================
// FINALIZE RECORD (DOCTOR)
// =======================
router.patch("/:id/finalize", async (req, res) => {
  try {
    requireRole(req.user.role, ["doctor"]);

    const recordId = Number(req.params.id);
    if (isNaN(recordId)) {
      return res.status(400).json({ error: "Invalid record id" });
    }

    const record = await prisma.medicalRecord.findUnique({
      where: { id: recordId },
    });

    if (!record) {
      return res.status(404).json({ error: "Medical record not found" });
    }

    // 🔒 LOCK FINAL
    if (record.status === "FINAL") {
      return res.status(400).json({
        error: "Medical record already FINAL",
      });
    }

    const { pharmacologyPlan, nonPharmacologyPlan } = req.body;

    await prisma.medicalRecord.update({
      where: { id: recordId },
      data: {
        pharmacologyPlan,
        nonPharmacologyPlan,
        status: "FINAL",
        doctorId: req.user.id,
      },
    });

    res.json({ message: "Medical record finalized", recordId });
  } catch (err) {
    res.status(403).json({ error: (err as Error).message });
  }
});

export default router;
