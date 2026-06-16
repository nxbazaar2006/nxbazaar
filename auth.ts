// auth.ts
import NextAuth from "next-auth";
import type { Adapter } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { z } from "zod";
import { UserRole } from "@prisma/client";

// ✅ Zod Schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db) as Adapter,

  secret:
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    (process.env.NODE_ENV === "development"
      ? "local-development-auth-secret"
      : undefined),

  // ✅ FIXED HERE
  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  providers: [
    Credentials({
      name: "credentials",

      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
         console.log("LOGIN DATA:", credentials);
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
            console.log("ZOD ERROR");
          throw new Error("Invalid inputs");
        }

        const { email, password } = parsed.data;

        const user = await db.user.findUnique({
          where: { email },
        });
  console.log("USER:", user);
        if (!user || !user.password) {
          throw new Error("User not found");
        }

        if (!user.status) {
          throw new Error("Account is inactive");
        }

        const isMatch = await compare(password, user.password);
 console.log("PASSWORD MATCH:", isMatch);
        if (!isMatch) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          emailVerified: user.emailVerified ? new Date() : null,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.emailVerified = user.emailVerified;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.status = token.status as boolean;
        session.user.emailVerified =
          token.emailVerified as Date | null;
      }
      return session;
    },
  },

  trustHost: true,
  debug: process.env.NODE_ENV === "development",
});
