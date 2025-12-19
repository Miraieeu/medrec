import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError";
import { prisma } from "../prisma";
import bcrypt from "bcrypt";

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password required", 400);
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const passwordValid = await bcrypt.compare(password, user.password);
  if (!passwordValid) {
    throw new AppError("Invalid credentials", 401);
  }

  // 🔐 GENERATE JWT (SATU-SATUNYA TEMPAT SIGN)
  const accessToken = jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET!,   // ⬅️ INI POIN UTAMA
    {
      issuer: "medrec-api",
      audience: "medrec-client",
      expiresIn: "15m",
    }
  );

  return res.json({ accessToken });
}
