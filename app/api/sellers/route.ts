import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { SellerSchema } from "@/lib/validators/seller.schema";
import { UserRole } from "@prisma/client";

/* ---------------- CREATE SELLER ---------------- */

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("BODY:", body); // 🔥 debug

    // ✅ Validate
    const parsed = SellerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // 🚨 HARD CHECK (most important)
    if (!data.userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }
    const userId = data.userId;

    // ✅ Check user exists
    const existingUser = await db.user.findUnique({
      where: { id: userId },
      include: { sellerProfile: true },
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // ✅ TRANSACTION (correct use)
    const sellerProfile = await db.$transaction(async (tx) => {
      // update user role
      await tx.user.update({
        where: { id: userId },
        data: {
          role: UserRole.SELLER,
          emailVerified: true,
        },
      });

      const profileData = {
        code: data.code,
        businessName: data.businessName,
        legalName: data.legalName,
        businessType: data.businessType,
        gstNumber: data.gstNumber,
        panNumber: data.panNumber,
        contactPerson: data.contactPerson,
        contactPersonPhone: data.contactPersonPhone,
        phone: data.phone,
        physicalAddress: data.physicalAddress,
        pickupAddress: data.pickupAddress,
        city: data.city,
        state: data.state,
        country: data.country,
        zip: data.zip,
        bankAccountName: data.bankAccountName,
        bankAccountNumber: data.bankAccountNumber,
        bankIfscCode: data.bankIfscCode,
        bankName: data.bankName,
        profileImageUrl: data.profileImageUrl,
        notes: data.notes,
        isActive: data.isActive,
        turnover: data.turnover,
        mainProduct: data.mainProduct,
      };

      // create or complete pending profile
      return await tx.sellerProfile.upsert({
        where: { userId },
        create: {
          ...profileData,
          user: {
            connect: { id: userId },
          },
        },
        update: profileData,
      });
    });

    return NextResponse.json(sellerProfile, { status: 201 });

  } catch (error) {
    console.error("CREATE SELLER ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to create Seller",
        error: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}

/* ---------------- GET SELLERS ---------------- */

export async function GET() {
  try {
    const sellers = await db.user.findMany({
      where: { role: UserRole.SELLER },
      include: { sellerProfile: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(sellers);

  } catch (error) {
    console.error("GET SELLERS ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch sellers",
        error: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}
