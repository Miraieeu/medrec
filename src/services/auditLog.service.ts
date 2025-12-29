import { prisma } from "../prisma";
import { AuditAction } from "@prisma/client";

export async function createAuditLog(input: {
  userId: number;
  action: AuditAction;
  entity: string;
  entityId: number;
  metadata?: any;
}) {
  return prisma.auditLog.create({
    data: {
      userId: input.userId,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      metadata: input.metadata,
    },
  });
}
