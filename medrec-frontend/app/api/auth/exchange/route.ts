import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthenticated" },
      { status: 401 }
    );
  }

  // 🔁 Exchange ke backend
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/exchange`,
    {
      method: "POST", // ⬅️ backend tetap POST
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: session.user.email,
        role: session.user.role,
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("BACKEND EXCHANGE ERROR =", text);
    return NextResponse.json(
      { error: "exchange failed" },
      { status: 500 }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
