import * as jwt from "jsonwebtoken";
import { SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma";

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new Error("Invalid credentials");
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  const payload = {
    id: user.id,
    role: user.role,
  };

  const options: SignOptions = {
    expiresIn: "1d",
  };

  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    options
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
    },
  };
}
