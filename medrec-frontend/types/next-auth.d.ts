import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      email: string;
      role: "admin" | "registration" | "nurse" | "doctor";
    };
  }

  interface User {
    email: string;
    role: "admin" | "registration" | "nurse" | "doctor";
  }
}
