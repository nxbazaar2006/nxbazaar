"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { SellerSchema } from "@/lib/validators/seller.schema";
import { UserRole } from "@prisma/client";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

function emptyToNull(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function getSellerProfileData(sellerData: ReturnType<typeof SellerSchema.parse>) {
  return {
    code: emptyToNull(sellerData.code),
    businessName: emptyToNull(sellerData.businessName),
    legalName: emptyToNull(sellerData.legalName),
    businessType: emptyToNull(sellerData.businessType),
    gstNumber: emptyToNull(sellerData.gstNumber),
    panNumber: emptyToNull(sellerData.panNumber),
    contactPerson: sellerData.contactPerson,
    contactPersonPhone: sellerData.contactPersonPhone,
    phone: sellerData.phone,
    physicalAddress: sellerData.physicalAddress,
    pickupAddress: emptyToNull(sellerData.pickupAddress),
    city: emptyToNull(sellerData.city),
    state: emptyToNull(sellerData.state),
    country: emptyToNull(sellerData.country),
    zip: emptyToNull(sellerData.zip),
    bankAccountName: emptyToNull(sellerData.bankAccountName),
    bankAccountNumber: emptyToNull(sellerData.bankAccountNumber),
    bankIfscCode: emptyToNull(sellerData.bankIfscCode),
    bankName: emptyToNull(sellerData.bankName),
    profileImageUrl: sellerData.profileImageUrl,
    notes: emptyToNull(sellerData.notes),
    isActive: sellerData.isActive,
    turnover: sellerData.turnover,
    mainProduct: emptyToNull(sellerData.mainProduct),
  };
}

/* ---------------- CREATE SELLER ---------------- */

export async function createSeller(data: unknown) {
  try {
    const sellerData = SellerSchema.parse(data);

    const seller = await db.$transaction(async (tx) => {
      const user = sellerData.userId
        ? await tx.user.update({
            where: { id: sellerData.userId },
            data: {
              name: sellerData.name,
              email: sellerData.email,
              role: UserRole.SELLER,
              emailVerified: true,
            },
          })
        : await tx.user.create({
            data: {
              name: sellerData.name,
              email: sellerData.email,
              password: randomUUID(),
              role: UserRole.SELLER,
              emailVerified: true,
            },
          });

      const profile = await tx.sellerProfile.upsert({
        where: { userId: user.id },
        create: {
          ...getSellerProfileData(sellerData),
          userId: user.id,
        },
        update: getSellerProfileData(sellerData),
      });

      return profile;
    });

    revalidatePath("/dashboard/sellers");

    return { success: true, data: seller };

  } catch (error: unknown) {
    console.error("CREATE SELLER ERROR:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create seller",
    };
  }
}
/* ---------------- GET SELLERS ---------------- */

export async function getSellers() {
  try {
    const sellers = await db.user.findMany({
      where: { role: UserRole.SELLER },
      include: { sellerProfile: true },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: sellers };

  } catch (error) {
    console.error("GET SELLERS ERROR:", error);

    return {
      success: false,
      error: "Failed to fetch sellers",
    };
  }
}

/* ---------------- DELETE SELLER ---------------- */

export async function deleteSeller(id: string) {
  try {
    await db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id },
      });

      if (!user) throw new Error("Seller not found");

      await tx.sellerProfile.deleteMany({
        where: { userId: id },
      });

      // 🔥 Recommended (soft delete)
      await tx.user.update({
        where: { id },
        data: {
          role: UserRole.USER,
        },
      });
    });

    revalidatePath("/dashboard/sellers");

    return { success: true };

  } catch (error) {
    console.error("DELETE SELLER ERROR:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}

/* ---------------- GET SELLER BY ID ---------------- */

export async function getSellerById(id: string) {
  try {
    const seller = await db.user.findUnique({
      where: { id },
      include: { sellerProfile: true },
    });

    if (!seller) {
      throw new Error("Seller not found");
    }

    return { success: true, data: seller };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Fetch failed",
    };
  }
}

/* ---------------- UPDATE SELLER ---------------- */

export async function updateSeller(id: string, data: unknown) {
  try {
    const sellerData = SellerSchema.parse(data); // ✅ FIXED

    const result = await db.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({
        where: { id },
        include: { sellerProfile: true },
      });

      if (!existing) throw new Error("Seller not found");
      if (!existing.sellerProfile)
        throw new Error("Seller profile not found");

      await tx.user.update({
        where: { id },
        data: {
          name: sellerData.name,
          email: sellerData.email,
          emailVerified: true,
        },
      });

      return await tx.sellerProfile.update({
        where: { userId: id },
        data: getSellerProfileData(sellerData),
      });
    });

    revalidatePath("/dashboard/sellers");

    return { success: true, data: result };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Update failed",
    };
  }
}

/* ---------------- UPDATE CURRENT SELLER PROFILE ---------------- */

export async function updateSellerProfileSettings(data: unknown) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const sellerData = SellerSchema.parse(data);

    await db.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });

      if (
        !existingUser ||
        (existingUser.role !== UserRole.SELLER &&
          existingUser.role !== UserRole.ADMIN)
      ) {
        throw new Error("Seller access required");
      }

      await tx.user.update({
        where: { id: session.user.id },
        data: {
          name: sellerData.name,
          email: sellerData.email,
          emailVerified: true,
        },
      });

      await tx.sellerProfile.upsert({
        where: { userId: session.user.id },
        create: {
          ...getSellerProfileData(sellerData),
          userId: session.user.id,
        },
        update: getSellerProfileData(sellerData),
      });
    });

    revalidatePath("/dashboard/seller-profile");
    revalidatePath("/dashboard/profile");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Seller profile update failed",
    };
  }
}
