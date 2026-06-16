"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  createUserSchema,
  profileSettingsSchema,
  updateUserSchema,
} from "@/lib/validators/userSchema";
import { revalidatePath } from "next/cache";

/* ---------------- CREATE USER ---------------- */

export async function createUser(data: unknown) {
  const validated = createUserSchema.parse(data);

  const user = await db.user.create({
    data: validated,
  });

  return user;
}

/* ---------------- GET USERS ---------------- */

export async function getUsers() {
  return await db.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

/* ---------------- GET USER ---------------- */

export async function getUser(id: string) {
  const user = await db.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

/* ---------------- UPDATE USER ---------------- */

export async function updateUser(id: string, data: unknown) {
  const validated = updateUserSchema.parse(data);

  return await db.user.update({
    where: { id },
    data: validated,
  });
}

function emptyToNull(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/* ---------------- UPDATE PROFILE SETTINGS ---------------- */

export async function updateProfileSettings(data: unknown) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const validated = profileSettingsSchema.parse(data);
    const dateOfBirth = emptyToNull(validated.dateOfBirth);

    await db.user.update({
      where: { id: session.user.id },
      data: {
        name: validated.name.trim(),
        email: validated.email.trim(),
        profile: {
          upsert: {
            create: {
              firstName: emptyToNull(validated.firstName),
              lastName: emptyToNull(validated.lastName),
              username: emptyToNull(validated.username),
              phone: emptyToNull(validated.phone),
              streetAddress: emptyToNull(validated.streetAddress),
              city: emptyToNull(validated.city),
              district: emptyToNull(validated.district),
              state: emptyToNull(validated.state),
              country: emptyToNull(validated.country),
              zip: emptyToNull(validated.zip),
              dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
              profileImage: emptyToNull(validated.profileImage),
            },
            update: {
              firstName: emptyToNull(validated.firstName),
              lastName: emptyToNull(validated.lastName),
              username: emptyToNull(validated.username),
              phone: emptyToNull(validated.phone),
              streetAddress: emptyToNull(validated.streetAddress),
              city: emptyToNull(validated.city),
              district: emptyToNull(validated.district),
              state: emptyToNull(validated.state),
              country: emptyToNull(validated.country),
              zip: emptyToNull(validated.zip),
              dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
              profileImage: emptyToNull(validated.profileImage),
            },
          },
        },
      },
    });

    revalidatePath("/dashboard/profile");

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Profile update failed";

    return { success: false, error: message };
  }
}

/* ---------------- DELETE USER ---------------- */

export async function deleteUser(id: string) {
  return await db.user.delete({
    where: { id },
  });
}

export async function getUserById(id: string) {
  return await db.user.findUnique({
    where: { id },
    include: {
      profile: true,
      sellerProfile: true,
    },
  });
}
