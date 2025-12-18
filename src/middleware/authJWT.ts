import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export function authJWT(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;

  console.group("🛡️ AUTH JWT");
  console.log("Authorization header =", auth);

  if (!auth) {
    console.log("❌ NO AUTH HEADER");
    console.groupEnd();
    return res.status(401).json({ error: "Missing token" });
  }

  const token = auth.split(" ")[1];
  console.log("token preview =", token.slice(0, 20) + "...");

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    console.log("payload =", payload);

    req.user = payload;
    console.groupEnd();
    next();
  } catch (err) {
    console.log("❌ INVALID TOKEN");
    console.groupEnd();
    return res.status(401).json({ error: "Invalid token" });
  }
}
