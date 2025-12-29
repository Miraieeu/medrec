function buildAuditPayload(audit) {
  return {
    auditId: audit.id,
    userId: audit.userId,
    action: audit.action,
    entity: audit.entity,
    entityId: audit.entityId,
    metadata: audit.metadata || {},
    createdAt: audit.createdAt.toISOString(),
  };
}

module.exports = { buildAuditPayload };
