import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function authJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Invalid token format" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;

    req.user = {
      id: payload.id,
      role: payload.role,
    };

    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
