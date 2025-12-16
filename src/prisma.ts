import { PrismaClient } from "@prisma/client";
import "dotenv/config";

console.log("DATABASE_URL =", process.env.DATABASE_URL);

export const prisma = new PrismaClient();
