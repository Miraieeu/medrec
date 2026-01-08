import { createHash } from "node:crypto";

export function hashAuditPayload(payload: any): string {
  return createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");
}
