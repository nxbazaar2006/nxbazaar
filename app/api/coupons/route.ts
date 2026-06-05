import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { couponSchema } from "@/lib/validators/coupon.schema";
import { getErrorMessage } from "@/lib/error-message";

// ================= CREATE =================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = couponSchema.parse(body);

    // Unique check
    const existing = await db.coupon.findFirst({
      where: { couponCode: validated.couponCode },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Coupon code already exists" },
        { status: 400 }
      );
    }

    // Vendor validation
    const vendor = await db.user.findUnique({
      where: { id: validated.vendorId },
    });

    if (!vendor) {
      return NextResponse.json(
        { message: "Invalid vendor" },
        { status: 400 }
      );
    }

    const coupon = await db.coupon.create({
      data: {
        ...validated,
        expiryDate: new Date(validated.expiryDate),
      },
      include: {
        vendor: true,
      },
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: getErrorMessage(error, "Failed to create coupon") },
      { status: 500 }
    );
  }
}

// ================= GET ALL =================
export async function GET() {
  try {
    const coupons = await db.coupon.findMany({
      include: { vendor: true },
      orderBy: { expiryDate: "desc" },
    });

    return NextResponse.json(coupons);
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

// ================= BULK DELETE =================
export async function DELETE(req: Request) {
  try {
    const { ids } = await req.json();

    await db.coupon.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({
      message: "Selected coupons deleted",
    });
  } catch {
    return NextResponse.json(
      { message: "Bulk delete failed" },
      { status: 500 }
    );
  }
}
