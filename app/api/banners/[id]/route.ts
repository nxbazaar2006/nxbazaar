import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bannerSchema } from "@/lib/validators/banner.schema";
import { getErrorMessage } from "@/lib/error-message";

// ================= GET ONE =================
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const banner = await db.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      return NextResponse.json(
        { message: "Banner not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(banner);

  } catch {
    return NextResponse.json(
      { message: "Failed to fetch banner" },
      { status: 500 }
    );
  }
}

// ================= UPDATE =================
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const body = await req.json();
    const validated = bannerSchema.parse(body);

    const updated = await db.banner.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json(updated);

  } catch (error: unknown) {
    return NextResponse.json(
      { message: getErrorMessage(error, "Failed to update banner") },
      { status: 500 }
    );
  }
}

// ================= DELETE =================
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const existingBanner = await db.banner.findUnique({
      where: { id },
    });

    if (!existingBanner) {
      return NextResponse.json(
        { message: "Banner not found" },
        { status: 404 }
      );
    }

    await db.banner.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Banner deleted successfully",
    });

  } catch {
    return NextResponse.json(
      { message: "Failed to delete banner" },
      { status: 500 }
    );
  }
}
