import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: "admin" | "registration" | "nurse" | "doctor";
    };
  }

  interface User {
    id: string;
    role: "admin" | "registration" | "nurse" | "doctor";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "admin" | "registration" | "nurse" | "doctor";
  }
}
