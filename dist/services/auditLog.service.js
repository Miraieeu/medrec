"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuditLog = createAuditLog;
const prisma_1 = require("../prisma");
const auditPayload_service_1 = require("./auditPayload.service");
const auditHash_service_1 = require("./auditHash.service");
const blockchain_service_1 = require("./blockchain.service");
async function createAuditLog(input) {
    console.log("🔥 createAuditLog CALLED", input);
    const audit = await prisma_1.prisma.auditLog.create({
        data: {
            userId: input.userId,
            action: input.action,
            entity: input.entity,
            entityId: input.entityId,
            metadata: input.metadata,
        },
    });
    const payload = (0, auditPayload_service_1.buildAuditPayload)(audit);
    const auditHash = (0, auditHash_service_1.hashAuditPayload)(payload);
    await prisma_1.prisma.auditLog.update({
        where: { id: audit.id },
        data: { auditHash },
    });
    const txHash = await (0, blockchain_service_1.commitAuditToBlockchain)(auditHash);
    await prisma_1.prisma.auditLog.update({
        where: { id: audit.id },
        data: {
            blockchainTxHash: txHash,
            blockchainCommittedAt: new Date(),
        },
    });
    return audit;
}
