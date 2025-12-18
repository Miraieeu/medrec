import { PrismaClient, AuditAction } from "@prisma/client";

const prisma = new PrismaClient();

export async function createAuditLog({
  userId,
  action,
  entity,
  entityId,
  metadata,
}: {
  userId: number;
  action: AuditAction;
  entity: string;
  entityId: number;
  metadata?: any;
}) {
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
