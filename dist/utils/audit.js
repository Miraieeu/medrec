"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAudit = logAudit;
const prisma_1 = require("../prisma");
async function logAudit({ userId, action, entity, entityId, metadata, }) {
    await prisma_1.prisma.auditLog.create({
        data: {
            userId,
            action,
            entity,
            entityId,
            metadata,
        },
    });
}
