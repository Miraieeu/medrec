import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { AppError } from "../errors/AppError";
import { prisma } from "../prisma";
import { Request, Response } from "express";

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password required", 400);
  }

  const ipAddress =
    (req.headers["x-forwarded-for"] as string) ||
    req.socket.remoteAddress ||
    null;

  const userAgent = req.headers["user-agent"] || null;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // ❌ USER TIDAK ADA
  if (!user) {
    await prisma.authLog.create({
      data: {
        email,
        action: "LOGIN_FAILED",
        ipAddress,
        userAgent,
      },
    });

    throw new AppError("Invalid credentials", 401);
  }

  const passwordValid = await bcrypt.compare(password, user.password);

  // ❌ PASSWORD SALAH
  if (!passwordValid) {
    await prisma.authLog.create({
      data: {
        userId: user.id,
        email,
        action: "LOGIN_FAILED",
        ipAddress,
        userAgent,
      },
    });

    throw new AppError("Invalid credentials", 401);
  }

  // 🔐 GENERATE JWT (SATU-SATUNYA TEMPAT SIGN)
  const accessToken = jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET!,
    {
      issuer: "medrec-api",
      audience: "medrec-client",
      expiresIn: "15m",
    }
  );

  // ✅ LOGIN BERHASIL
  await prisma.authLog.create({
    data: {
      userId: user.id,
      email: user.email,
      action: "LOGIN_SUCCESS",
      ipAddress,
      userAgent,
    },
  });

  return res.json({ accessToken });
}

/**
 * LOGOUT (dipanggil manual dari route)
 */
export async function logout(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  await prisma.authLog.create({
    data: {
      userId: req.user.id,
      email: req.user.email,
      action: "LOGOUT",
      ipAddress:
        (req.headers["x-forwarded-for"] as string) ||
        req.socket.remoteAddress ||
        null,
      userAgent: req.headers["user-agent"] || null,
    },
  });

  res.json({ success: true });
}
