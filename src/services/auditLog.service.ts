import { prisma } from "../prisma";
import { AuditAction } from "@prisma/client";
import { buildAuditPayload } from "./auditPayload.service";
import { hashAuditPayload } from "./auditHash.service";
import { commitAuditToBlockchain } from "./blockchain.service";

export async function createAuditLog(input: {
  userId: number;
  action: AuditAction;
  entity: string;
  entityId: number;
  metadata?: any;
}) {
  console.log("🔥 createAuditLog CALLED", input);
  const audit = await prisma.auditLog.create({
    data: {
      userId: input.userId,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      metadata: input.metadata,
    },
  });

  const payload = buildAuditPayload(audit);
  const auditHash = hashAuditPayload(payload);

  await prisma.auditLog.update({
    where: { id: audit.id },
    data: { auditHash },
  });

  const txHash = await commitAuditToBlockchain(auditHash);

  await prisma.auditLog.update({
    where: { id: audit.id },
    data: {
      blockchainTxHash: txHash,
      blockchainCommittedAt: new Date(),
    },
  });

  return audit;
}
