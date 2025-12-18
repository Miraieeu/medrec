import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!valid) return null;

        // ⬇️ INI SUDAH BENAR
        return {
          id: user.id.toString(),
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;      // ⬅️ WAJIB
        token.role = user.role;  // ⬅️ SUDAH ADA
      }
      console.log("JWT CALLBACK", {
      tokenRole: token.role,
      userRole: (user as any)?.role,
    });
      return token;
    },

    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
      }
       console.log("SESSION CALLBACK", {
    sessionUser: session.user,
    role: (session.user as any)?.role,
  });
      return session;
    },
  },
});

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!valid) return null;

        return {
          id: user.id.toString(),
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};



export { handler as GET, handler as POST };
