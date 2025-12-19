import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError";

export function authJWT(req, _res, next) {
  const auth = req.headers.authorization;
  console.log("🛡️ AUTH JWT HIT");
  console.log("Authorization =", req.headers.authorization);
  if (!auth || !auth.startsWith("Bearer ")) {
    throw new AppError("Missing token", 401);
  }

  const token = auth.slice(7);

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as {
      id: number;
      role: string;
      email?: string;
    };

    // ✅ WAJIB id & role
    if (!payload.id || !payload.role) {
      throw new AppError("Invalid token payload", 401);
    }

    // 🔥 INI YANG DIPAKAI PRISMA
    req.user = {
      id: payload.id,
      role: payload.role,
      email: payload.email,
    };

    next();
  } catch (err) {
    throw new AppError("Invalid token", 401);
  }
}
export function waitForApiToken(): Promise<void> {
  return new Promise((resolve, reject) => {
    let tries = 0;

    const interval = setInterval(() => {
      const token = getApiToken(); // ⬅️ ambil ulang dari storage
      if (token) {
        clearInterval(interval);
        resolve();
      }

      tries++;
      if (tries > 30) {
        clearInterval(interval);
        reject(new Error("API token not ready"));
      }
    }, 100);
  });
}
function getApiToken(): string | null {
  const token = process.env.API_TOKEN;
  return token || null;
}

