import { getServerSession } from "next-auth";
import { authOptions } from "../authOptions";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  const res = await fetch("http://localhost:4000/api/auth/exchange", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: session.user.email }),
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Exchange failed" },
      { status: 500 }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
