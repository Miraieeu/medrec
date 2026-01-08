"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashAuditPayload = hashAuditPayload;
const node_crypto_1 = require("node:crypto");
function hashAuditPayload(payload) {
    return (0, node_crypto_1.createHash)("sha256")
        .update(JSON.stringify(payload))
        .digest("hex");
}
