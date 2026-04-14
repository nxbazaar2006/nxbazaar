"use server";

import {db} from "@/lib/db";
import { verifyEmailSchema } from "@/lib/validators/userSchema";

export async function verifyEmailAction(data: unknown) {
  try {
    const parsed = verifyEmailSchema.parse(data);

    const user = await db.user.findUnique({
      where: {
        id: parsed.id,
      },
    });

    if (!user) {
      throw new Error("No User Found");
    }

    const updatedUser = await db.user.update({
      where: {
        id: parsed.id,
      },
      data: {
        emailVerified: true,
        verificationToken: null,
      },
    });

    return updatedUser;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to verify email");
  }
}
