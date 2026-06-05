import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { vlogSchema } from "@/lib/validators/vlog.schema";
import { Language } from "@prisma/client";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vlog = await db.vlog.findUnique({ where: { id }, include: { translations: true, product: true, user: true, blog: true } });
  if (!vlog) return NextResponse.json({ success: false, message: "Vlog not found" }, { status: 404 });
  return NextResponse.json({ success: true, message: "Vlog fetched successfully", data: vlog });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const validated = vlogSchema.parse(await req.json());
    const vlog = await db.vlog.update({
      where: { id },
      data: {
        title: validated.title,
        productId: validated.productId,
        userId: validated.userId,
        blogId: validated.blogId,
        translations: {
          deleteMany: {},
          create: validated.translations.map(
            (t: (typeof validated.translations)[number]) => ({
              ...t,
              locale: t.locale.toUpperCase() as Language,
            })
          ),
        },
      },
      include: { translations: true },
    });
    return NextResponse.json({ success: true, message: "Vlog updated successfully", data: vlog });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to update vlog" }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.vlog.delete({ where: { id } });
  return NextResponse.json({ success: true, message: "Vlog deleted successfully", data: null });
}
