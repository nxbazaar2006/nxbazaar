"use server";

import { db } from "@/lib/db";
import { SellerSchema } from "@/lib/validators/seller.schema";
import { UserRole } from "@prisma/client";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

function getSellerProfileData(sellerData: ReturnType<typeof SellerSchema.parse>) {
  return {
    code: sellerData.code,
    contactPerson: sellerData.contactPerson,
    contactPersonPhone: sellerData.contactPersonPhone,
    phone: sellerData.phone,
    physicalAddress: sellerData.physicalAddress,
    profileImageUrl: sellerData.profileImageUrl,
    notes: sellerData.notes,
    isActive: sellerData.isActive,
    turnover: sellerData.turnover,
    mainProduct: sellerData.mainProduct,
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

      const profile = await tx.sellerProfile.create({
        data: {
          ...getSellerProfileData(sellerData),
          userId: user.id,
        },
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
