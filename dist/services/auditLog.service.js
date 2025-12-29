"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuditLog = createAuditLog;
const prisma_1 = require("../prisma");
async function createAuditLog(input) {
    return prisma_1.prisma.auditLog.create({
        data: {
            userId: input.userId,
            action: input.action,
            entity: input.entity,
            entityId: input.entityId,
            metadata: input.metadata,
        },
    });
}
