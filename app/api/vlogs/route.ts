import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { vlogSchema } from "@/lib/validators/vlog.schema";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const locale = searchParams.get("locale")?.toUpperCase();
  const search = searchParams.get("search") ?? "";
  const data = await db.vlog.findMany({
    where: search
      ? { OR: [{ title: { contains: search, mode: "insensitive" } }, { translations: { some: { title: { contains: search, mode: "insensitive" } } } }] }
      : undefined,
    include: { translations: locale ? { where: { locale: locale as any } } : true, product: true, user: true, blog: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ success: true, message: "Vlogs fetched successfully", data });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = vlogSchema.parse(body);
    const vlog = await db.vlog.create({
      data: {
        title: validated.title,
        productId: validated.productId,
        userId: validated.userId,
        blogId: validated.blogId,
        translations: { create: validated.translations.map((t) => ({ ...t, locale: t.locale.toUpperCase() as any })) },
      },
      include: { translations: true },
    });
    return NextResponse.json({ success: true, message: "Vlog created successfully", data: vlog });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to create vlog" }, { status: 400 });
  }
}
