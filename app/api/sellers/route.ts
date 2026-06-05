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

    // ✅ Check user exists
    const existingUser = await db.user.findUnique({
      where: { id: data.userId },
      include: { sellerProfile: true },
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // ❌ prevent duplicate seller
    if (existingUser.sellerProfile) {
      return NextResponse.json(
        { message: "Seller already exists" },
        { status: 400 }
      );
    }

    // ✅ TRANSACTION (correct use)
    const sellerProfile = await db.$transaction(async (tx) => {
      // update user role
      await tx.user.update({
        where: { id: data.userId },
        data: {
          role: UserRole.SELLER,
          emailVerified: true,
        },
      });

      // create profile
      return await tx.sellerProfile.create({
        data: {
          ...data,
          turnover: data.turnover
            ? parseFloat(data.turnover)
            : null,
        },
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
