import { prisma } from "../prisma";
import { AuditAction } from "@prisma/client";

interface AuditParams {
  userId: number;
  action: AuditAction;
  entity: string;
  entityId: number;
  metadata?: any;
}

export async function logAudit({
  userId,
  action,
  entity,
  entityId,
  metadata,
}: AuditParams) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entity,
      entityId,
      metadata,
    },
  });
}
