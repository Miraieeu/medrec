
import { NextResponse } from "next/server";

export async function GET() {
  console.log("SERVER SESSION =", session);
  return NextResponse.json(session);
}
