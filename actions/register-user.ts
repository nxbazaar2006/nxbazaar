"use server";

import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import { registerSchema } from "@/lib/validators/registerSchema";

export async function registerUser(data: unknown) {
  const validated = registerSchema.parse(data);

  const existingUser = await db.user.findUnique({
    where: { email: validated.email },
  });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(validated.password, 10);

  const user = await db.user.create({
    data: {
      name: validated.name,
      email: validated.email,
      password: hashedPassword,
      role: validated.role,
      plan: validated.plan,
      profile: {
        create: {},
      },
      ...(validated.role === "SELLER"
        ? {
            sellerProfile: {
              create: {},
            },
          }
        : {}),
    },
    include: {
      profile: true,
      sellerProfile: true,
    },
  });

  return user;
}
