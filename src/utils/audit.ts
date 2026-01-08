import { createAuditLog } from "../services/auditLog.service";
import { AuditAction } from "@prisma/client";

export async function auditLog(params: {
  userId: number;
  action: AuditAction;
  entity: string;
  entityId: number;
  metadata?: any;
}) {
  return createAuditLog(params);
}