import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bannerSchema } from "@/lib/validators/banner.schema";
import { getErrorMessage } from "@/lib/error-message";

// ================= CREATE =================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = bannerSchema.parse(body);

    const banner = await db.banner.create({
      data: {
        ...validated,
        link: validated.link ?? "",
      },
    });

    return NextResponse.json(banner, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: getErrorMessage(error, "Failed to create banner") },
      { status: 500 }
    );
  }
}

// ================= GET ALL =================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("active");

    const banners = await db.banner.findMany({
      where:
        activeOnly === "true"
          ? { isActive: true }
          : undefined,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(banners);
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch banners" },
      { status: 500 }
    );
  }
}

// ================= BULK DELETE =================
export async function DELETE(req: Request) {
  try {
    const { ids } = await req.json();

    await db.banner.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({
      message: "Selected banners deleted",
    });
  } catch {
    return NextResponse.json(
      { message: "Bulk delete failed" },
      { status: 500 }
    );
  }
}
