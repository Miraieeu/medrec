import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError";

export function authJWT(req, _res, next) {
  const auth = req.headers.authorization;

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
