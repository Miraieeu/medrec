import { Request, Response, NextFunction } from "express";
import { getToken } from "next-auth/jwt";

export async function authFromNextAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // ⬇️ INI KUNCINYA
    const token = await getToken({
  req: { headers: { cookie: req.headers.cookie ?? "" } } as any,
  secret: process.env.NEXTAUTH_SECRET,
});
    console.log("COOKIE =", req.headers.cookie);
    console.log("TOKEN =", token);

    if (!token) {
      console.log("❌ TOKEN NULL");
      console.log("COOKIE =", req.headers.cookie);
      return res.status(401).json({ error: "Unauthenticated" });
    }

    if (!token.sub || !token.role) {
      console.log("❌ TOKEN INVALID", token);
      return res.status(401).json({ error: "Unauthenticated" });
    }

    req.user = {
      id: Number(token.sub),
      role: token.role as string,
    };

    console.log("✅ AUTH OK", req.user);

    next();
  } catch (err) {
    console.error("authFromNextAuth error:", err);
    return res.status(500).json({ error: "Auth error" });
  }
}
