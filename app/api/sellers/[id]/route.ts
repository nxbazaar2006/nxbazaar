import { db } from "@/lib/db";
import { NextResponse } from "next/server";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

/* ---------------- GET SELLER ---------------- */

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Seller ID is required" },
        { status: 400 }
      );
    }

    const seller = await db.user.findUnique({
      where: { id },
      include: { sellerProfile: true },
    });

    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Seller not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: seller,
    });

  } catch (error) {
    console.error("GET SELLER ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch seller" },
      { status: 500 }
    );
  }
}

/* ---------------- DELETE SELLER ---------------- */

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Seller ID is required" },
        { status: 400 }
      );
    }

    await db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new Error("Seller not found");
      }

      // ✅ delete profile first
      await tx.sellerProfile.deleteMany({
        where: { userId: id },
      });

      // ⚠️ optional: instead of delete → downgrade
      await tx.user.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Seller deleted successfully",
    });

  } catch (error) {
    console.error("DELETE SELLER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Delete failed",
      },
      { status: 500 }
    );
  }
}

/* ---------------- UPDATE SELLER ---------------- */

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Seller ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, emailVerified } = body;

    const updatedUser = await db.user.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(emailVerified !== undefined && { emailVerified }),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "Seller updated successfully",
    });

  } catch (error) {
    console.error("UPDATE SELLER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Update failed",
      },
      { status: 500 }
    );
  }
}
