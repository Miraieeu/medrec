"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLog = auditLog;
const auditLog_service_1 = require("../services/auditLog.service");
async function auditLog(params) {
    return (0, auditLog_service_1.createAuditLog)(params);
}
