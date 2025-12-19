import jwt, {JwtPayload}from "jsonwebtoken";
import { AppError } from "../errors/AppError";

export function authJWT(req, _res, next) {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Bearer ")) {
    throw new AppError("Missing token", 401);
  }

  const token = auth.slice(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    if (
  typeof decoded !== "object" ||
  decoded === null ||
  !("sub" in decoded) ||
  !("role" in decoded)
) {
  throw new AppError("Invalid token payload", 401);
}

const payload = decoded as JwtPayload & {
  sub: number;
  role: string;
  email?: string;
};

    if (!payload.sub || !payload.role) {
      throw new AppError("Invalid token payload", 401);
    }

    req.user = {
      id: payload.sub,
      role: payload.role,
      email: payload.email,
    };

    next();
  } catch {
    throw new AppError("Invalid token", 401);
  }
}
