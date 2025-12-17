import bcrypt from "bcryptjs";
import jwt, { Secret } from "jsonwebtoken";
import { prisma } from "../prisma";
import { AppError } from "../errors/AppError";

export async function login(email: string, password: string) {
  // 1️⃣ Validasi input
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  // 2️⃣ Cari user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // ❗ Jangan bocorkan apakah email atau password yang salah
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  // 3️⃣ Cek password
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw new AppError("Invalid email or password", 401);
  }

  // 4️⃣ Pastikan JWT_SECRET ada
  if (!process.env.JWT_SECRET) {
    throw new AppError("Server misconfiguration", 500);
  }

  const JWT_SECRET = process.env.JWT_SECRET as Secret;

  // 5️⃣ Generate token
  const token = jwt.sign(
    {
      id: String(user.id),
      role: String(user.role),
    },
    JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    } as any
  );

  // 6️⃣ Response rapi untuk UI
  return {
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    },
  };
}
