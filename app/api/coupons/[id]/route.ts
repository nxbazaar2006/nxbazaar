import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { couponSchema } from "@/lib/validators/coupon.schema";
import { getErrorMessage } from "@/lib/error-message";

// ================= GET ONE =================
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const coupon = await db.coupon.findUnique({
      where: { id },
      include: { vendor: true },
    });

    if (!coupon)
      return NextResponse.json(
        { message: "Coupon not found" },
        { status: 404 }
      );

    return NextResponse.json(coupon);
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch coupon" },
      { status: 500 }
    );
  }
}

// ================= UPDATE =================
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validated = couponSchema.parse(body);

    const updated = await db.coupon.update({
      where: { id },
      data: {
        ...validated,
        expiryDate: new Date(validated.expiryDate),
      },
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    return NextResponse.json(
      { message: getErrorMessage(error, "Failed to update coupon") },
      { status: 500 }
    );
  }
}

// ================= DELETE =================
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.coupon.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Coupon deleted",
    });
  } catch {
    return NextResponse.json(
      { message: "Failed to delete coupon" },
      { status: 500 }
    );
  }
}
