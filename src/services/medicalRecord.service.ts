import { prisma } from "../prisma";
import { AppError } from "../errors/AppError";

/**
 * Pastikan medical record ada & masih bisa diedit
 * Digunakan sebelum UPDATE apapun
 */
export async function assertRecordEditable(recordId: number) {
  const record = await prisma.medicalRecord.findUnique({
    where: { id: recordId },
  });

  if (!record) {
    throw new Error(
      "Medical record not found. Queue may not have been called yet."
    );
  }

  if (record.status === "FINAL") {
    throw new Error("Medical record is FINAL and cannot be modified");
  }

  return record;
}

