// auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { z } from "zod";

// ✅ Zod Schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  secret:
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    (process.env.NODE_ENV === "development"
      ? "local-development-auth-secret"
      : undefined),

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  providers: [
    Credentials({
      name: "credentials",

      // ✅ FIX: required credentials field
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        // ✅ Validate input
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          throw new Error("Invalid inputs");
        }

        const { email, password } = parsed.data;

        // ✅ Find user
        const user = await db.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          throw new Error("User not found");
        }

        // ✅ Block inactive users
        if (!user.status) {
          throw new Error("Account is inactive");
        }

        // ✅ Check password
        const isMatch = await compare(password, user.password);

        if (!isMatch) {
          throw new Error("Invalid credentials");
        }

        // ✅ Return safe user object
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status, // boolean
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status; // ✅ boolean
        token.emailVerified = user.emailVerified;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.status = token.status as boolean;
        session.user.emailVerified =
          token.emailVerified as Date | null;
      }
      return session;
    },
  },

  trustHost: true,
});
