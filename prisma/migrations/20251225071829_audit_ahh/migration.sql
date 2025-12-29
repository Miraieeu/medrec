-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "auditHash" VARCHAR(66),
ADD COLUMN     "blockchainCommittedAt" TIMESTAMP(3),
ADD COLUMN     "blockchainTxHash" VARCHAR(66);
