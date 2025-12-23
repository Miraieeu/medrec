"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertRecordEditable = assertRecordEditable;
const prisma_1 = require("../prisma");
const AppError_1 = require("../errors/AppError");
/**
 * Pastikan medical record:
 * 1. Ada
 * 2. Masih editable (belum FINAL)
 *
 * CATATAN DESAIN:
 * - Queue TIDAK diperiksa di sini
 * - FINAL adalah satu-satunya hard lock
 * - Aman terhadap crash & retry
 */
async function assertRecordEditable(recordId) {
    if (!recordId || isNaN(recordId)) {
        throw new AppError_1.AppError("Invalid medical record id", 400);
    }
    const record = await prisma_1.prisma.medicalRecord.findUnique({
        where: { id: recordId },
        select: {
            id: true,
            status: true,
        },
    });
    // ❌ Record tidak ada
    if (!record) {
        throw new AppError_1.AppError("Medical record not found", 404);
    }
    // 🔒 Hard lock
    if (record.status === "FINAL") {
        throw new AppError_1.AppError("Medical record has been finalized and cannot be modified", 409);
    }
    // ✅ Editable
}
