import { Router } from "express";
import crypto from "crypto";
import { prisma } from "../prisma";
import { generateMRN } from "../utils/mrn";
import { AppError } from "../errors/AppError";

const router = Router();

/**
 * @swagger
 * /api/patients/search:
 *   get:
 *     summary: Search patient by name or MRN
 *     tags: [Patient]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of patients
 */

// =======================
// SEARCH PATIENT
// =======================
router.get("/search", async (req, res) => {
  const q = String(req.query.q || "").trim();

  if (!q) {
    throw new AppError("Search query is required", 400);
  }

  const patients = await prisma.patient.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { medicalRecordNumber: { contains: q } },
      ],
    },
    take: 10,
  });

  res.json({
    success: true,
    data: patients,
  });
});

/**
 * @swagger
 * /api/patients:
 *   post:
 *     summary: Create patient
 *     tags: [Patient]
 */

// =======================
// CREATE PATIENT
// =======================
router.post("/", async (req, res) => {
  const { name, nik, dob, address } = req.body;

  // 🔍 Validasi input
  if (!name || !nik || !dob || !address) {
    throw new AppError("All fields are required", 400);
  }

  if (nik.length !== 16) {
    throw new AppError("Invalid NIK format", 400);
  }

  const nikHash = crypto.createHash("sha256").update(nik).digest("hex");

  // ❗ Cegah duplikasi NIK
  const exists = await prisma.patient.findUnique({
    where: { nikHash },
  });

  if (exists) {
    throw new AppError("Patient with this NIK already exists", 409);
  }

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

  res.status(201).json({
    success: true,
    data: patient,
  });
});

/**
 * @swagger
 * /api/patients:
 *   get:
 *     summary: List all patients
 *     tags: [Patient]
 */

// =======================
// LIST PATIENTS
// =======================
router.get("/", async (_req, res) => {
  const patients = await prisma.patient.findMany();

  res.json({
    success: true,
    data: patients,
  });
});

/**
 * @swagger
 * /api/patients/by-nik:
 *   get:
 *     summary: Get patient by NIK
 *     tags: [Patient]
 *     parameters:
 *       - in: query
 *         name: nik
 *         required: true
 *         schema:
 *           type: string
 */

// =======================
// GET PATIENT BY NIK (UI)
// =======================
router.get("/by-nik", async (req, res) => {
  const nik = String(req.query.nik || "").trim();

  if (!nik) {
    throw new AppError("NIK is required", 400);
  }

  if (nik.length !== 16) {
    throw new AppError("Invalid NIK format", 400);
  }

  const patient = await prisma.patient.findFirst({
    where: { nik },
  });

  if (!patient) {
    throw new AppError("Patient not found", 404);
  }

  res.json({
    success: true,
    data: patient,
  });
});

export default router;
