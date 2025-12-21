import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.JWT_SECRET,
  });

  if (!token || token.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

const logs = await prisma.auditLog.findMany({
  orderBy: { createdAt: "desc" },
  take: 100,
  include: {
    user: {
      select: {
        email: true,
        role: true,
      },
    },
  },
});


  return NextResponse.json(logs);
}
