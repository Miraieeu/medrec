const crypto = require("crypto");

function hashAuditPayload(payload) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");
}

module.exports = { hashAuditPayload };
