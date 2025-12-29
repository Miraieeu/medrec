import { prisma } from "../prisma";
import { AppError } from "../errors/AppError";

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
export async function assertRecordEditable(recordId: number): Promise<void> {
  if (!recordId || isNaN(recordId)) {
    throw new AppError("Invalid medical record id", 400);
  }

  const record = await prisma.medicalRecord.findUnique({
    where: { id: recordId },
    select: {
      id: true,
      status: true,
    },
  });

  // ❌ Record tidak ada
  if (!record) {
    throw new AppError("Medical record not found", 404);
  }

  // 🔒 Hard lock
  if (record.status === "FINAL") {
    throw new AppError(
      "Medical record has been finalized and cannot be modified",
      409
    );
  }

  // ✅ Editable
}
