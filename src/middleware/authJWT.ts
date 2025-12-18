import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export function authJWT(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }

  const token = header.replace("Bearer ", "");

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;

    req.user = {
      id: payload.userId,
      role: payload.role,
    };

    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
