"use server";

import { db } from "@/lib/db";
import { CustomerInput } from "@/lib/validators/customer.schema";
import { Prisma, UserRole } from "@prisma/client";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

function getCustomerProfileData(
  data: CustomerInput
): Prisma.UserProfileCreateWithoutUserInput & Prisma.UserProfileUpdateWithoutUserInput {
  return {
    username: data.username,
    phone: data.phone,
    firstName: data.firstName,
    lastName: data.lastName,
    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
    streetAddress: data.streetAddress,
    city: data.city,
    district: data.district,
    country: data.country,
    profileImage: data.profileImage,
  };
}

/* CREATE */
export async function createCustomer(data: CustomerInput) {
  try {
    const customer = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: randomUUID(),
        role: UserRole.USER,
        profile: {
          create: getCustomerProfileData(data),
        },
      },
      include: {
        profile: true,
      },
    });

    revalidatePath("/dashboard/customers");

    return { success: true, data: customer };
  } catch {
    return { success: false, error: "Failed to create customer" };
  }
}

/* GET ALL */
export async function getCustomers() {
  const customers = await db.user.findMany({
    where: {
      role: UserRole.USER,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      profile: true,
    },
  });

  return customers;
}

/* GET SINGLE */
export async function getCustomer(id: string) {
  const customer = await db.user.findUnique({
    where: {
      id,
    },
    include: {
      profile: true,
    },
  });

  return customer;
}

/* UPDATE */
export async function updateCustomer(id: string, data: CustomerInput) {
  try {
    const profileData = getCustomerProfileData(data);
    const customer = await db.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        profile: {
          upsert: {
            create: profileData,
            update: profileData,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    revalidatePath("/dashboard/customers");

    return { success: true, data: customer };
  } catch {
    return { success: false, error: "Failed to update customer" };
  }
}

/* DELETE */
export async function deleteCustomer(id: string) {
  try {
    await db.user.delete({
      where: { id },
    });

    revalidatePath("/dashboard/customers");

    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete customer" };
  }
}
