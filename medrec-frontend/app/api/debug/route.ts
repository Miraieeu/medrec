import { NextResponse } from "next/server";

export async function GET() {
  console.log("PWD =", process.cwd());
  console.log("SECRET =", process.env.NEXTAUTH_SECRET);
  return NextResponse.json({ ok: true });
}
