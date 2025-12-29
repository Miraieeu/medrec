import crypto from "crypto";

export function hashNik(nik: string) {
  return crypto
    .createHash("sha256")
    .update(nik + process.env.NIK_SALT)
    .digest("hex");
}