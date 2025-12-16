import { Router } from "express";
import crypto from "crypto";
import { prisma } from "../prisma";
import { generateMRN } from "../utils/mrn";

const router = Router();

// CREATE patient
router.post("/", async (req, res) => {
  const { name, nik, dob, address } = req.body;

  const nikHash = crypto.createHash("sha256").update(nik).digest("hex");

  const count = await prisma.patient.count();

  const patient = await prisma.patient.create({
    data: {
      name,
      nik,
      nikHash,
      dob: new Date(dob),
      address,
      medicalRecordNumber: generateMRN(count + 1),
    },
  });

  res.json(patient);
});

// LIST patients
router.get("/", async (req, res) => {
  const patients = await prisma.patient.findMany();
  res.json(patients);
});

export default router;
