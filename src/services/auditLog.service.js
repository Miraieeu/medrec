const { prisma } = require("../prisma");
const { buildAuditPayload } = require("./auditPayload.service");
const { hashAuditPayload } = require("./auditHash.service");
const { commitAuditToBlockchain } = require("./blockchain.service");

/**
 * Create audit log, hash it, and asynchronously commit hash to blockchain
 */
async function createAuditLog(input) {
  // 1️⃣ Simpan audit log awal
  const audit = await prisma.auditLog.create({
    data: {
      userId: input.userId,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      metadata: input.metadata,
    },
  });

  // 2️⃣ Build payload & hash
  const payload = buildAuditPayload(audit);
  const auditHash = hashAuditPayload(payload);

  // 3️⃣ Simpan hash ke database
  await prisma.auditLog.update({
    where: { id: audit.id },
    data: { auditHash },
  });

  // 4️⃣ Commit hash ke blockchain (ASYNC, non-blocking)
  setImmediate(async () => {
    try {
      const txHash = await commitAuditToBlockchain(auditHash);

      await prisma.auditLog.update({
        where: { id: audit.id },
        data: {
          blockchainTxHash: txHash,
          blockchainCommittedAt: new Date(),
        },
      });
    } catch (err) {
      console.error(
        "[AUDIT][BLOCKCHAIN] Commit failed:",
        err.message
      );
    }
  });

  return audit;
}

module.exports = { createAuditLog };
