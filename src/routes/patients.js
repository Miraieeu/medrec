"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../prisma");
const mrn_1 = require("../utils/mrn");
const AppError_1 = require("../errors/AppError");
const router = (0, express_1.Router)();
function parseDob(dob) {
    // harus DD/MM/YYYY
    const match = dob.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) {
        throw new AppError_1.AppError("DOB format must be DD/MM/YYYY", 400);
    }
    const [, day, month, year] = match;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    // validasi ulang (JS suka auto-correct tanggal)
    if (date.getFullYear() !== Number(year) ||
        date.getMonth() !== Number(month) - 1 ||
        date.getDate() !== Number(day)) {
        throw new AppError_1.AppError("Invalid DOB value", 400);
    }
    return date;
}
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
        throw new AppError_1.AppError("Search query is required", 400);
    }
    const patients = await prisma_1.prisma.patient.findMany({
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
    if (!name || !nik || !dob || !address) {
        throw new AppError_1.AppError("Harus diisi semua!", 400);
    }
    if (!/^\d{16}$/.test(nik)) {
        throw new AppError_1.AppError("NIK harus 16 digit!", 400);
    }
    // ⬇️ VALIDASI & PARSE DOB (SATU-SATUNYA SUMBER KEBENARAN)
    const dobDate = parseDob(dob);
    // 🔒 blok tanggal masa depan
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dobDate > today) {
        throw new AppError_1.AppError("Tanggal lahir tidak boleh di masa depan", 400);
    }
    const nikHash = crypto_1.default.createHash("sha256").update(nik).digest("hex");
    const exists = await prisma_1.prisma.patient.findUnique({
        where: { nikHash },
    });
    if (exists) {
        throw new AppError_1.AppError("Pasien dengan NIK ini sudah ada", 409);
    }
    const count = await prisma_1.prisma.patient.count();
    const patient = await prisma_1.prisma.patient.create({
        data: {
            name,
            nik,
            nikHash,
            dob: dobDate, // ✅ VALID DATE
            address,
            medicalRecordNumber: (0, mrn_1.generateMRN)(count + 1),
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
    const patients = await prisma_1.prisma.patient.findMany();
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
        throw new AppError_1.AppError("NIK is required", 400);
    }
    if (nik.length !== 16) {
        throw new AppError_1.AppError("Invalid NIK format", 400);
    }
    const patient = await prisma_1.prisma.patient.findFirst({
        where: { nik },
    });
    if (!patient) {
        throw new AppError_1.AppError("Patient not found", 404);
    }
    res.json({
        success: true,
        data: patient,
    });
});
exports.default = router;
