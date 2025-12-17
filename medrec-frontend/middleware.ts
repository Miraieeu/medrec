import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const pathname = req.nextUrl.pathname;

  // 🔒 BELUM LOGIN
  if (!token) {
    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }

  const role = token.role as string | undefined;

  // 🔒 ADMIN
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(
      new URL("/unauthorized", req.url)
    );
  }

  // 🔒 REGISTRATION
  if (pathname.startsWith("/registration") && role !== "registration") {
    return NextResponse.redirect(
      new URL("/unauthorized", req.url)
    );
  }

  // 🔒 NURSE
  if (pathname.startsWith("/nurse") && role !== "nurse") {
    return NextResponse.redirect(
      new URL("/unauthorized", req.url)
    );
  }

  // 🔒 DOCTOR
  if (pathname.startsWith("/doctor") && role !== "doctor") {
    return NextResponse.redirect(
      new URL("/unauthorized", req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/registration/:path*",
    "/nurse/:path*",
    "/doctor/:path*",
  ],
};
