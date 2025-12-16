import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

// List records by patient
router.get("/patient/:id", async (req, res) => {
  const records = await prisma.medicalRecord.findMany({
    where: { patientId: Number(req.params.id) },
  });

  res.json(records);
});

export default router;
