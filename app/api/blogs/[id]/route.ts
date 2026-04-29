import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogSchema } from "@/lib/validators/blog.schema";
import { generateUniqueSlug } from "@/lib/generateUniqueSlug";

type Params = {
  params: { id: string };
};

// ================= GET SINGLE =================
export async function GET(_: NextRequest, { params }: Params) {
  try {
    const blog = await db.blog.findUnique({
      where: { id: params.id },
      include: {
        translations: true,
        category: true,
        relatedProducts: true,
        user: true,
      },
    });

    if (!blog) {
      return NextResponse.json(
        { message: "Blog not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(blog);
  } catch {
    return NextResponse.json(
      { message: "Error fetching blog" },
      { status: 500 }
    );
  }
}

// ================= UPDATE =================
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const body: unknown = await req.json();
    const data = blogSchema.parse(body);

    const title = data.translations[0]?.title;

    if (!title) {
      return NextResponse.json(
        { message: "Title required" },
        { status: 400 }
      );
    }

    const slug = await generateUniqueSlug(
      "blog",
      title,
      params.id
    );

    const updated = await db.blog.update({
      where: { id: params.id },
      data: {
        slug,
        imageUrl: data.imageUrl,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        content: data.content,
        categoryId: data.categoryId,
        publishedAt: data.publishedAt,

        translations: {
          deleteMany: {},
          create: data.translations,
        },

        // 🔥 reset relations
        relatedProducts: {
          set: data.relatedProductIds?.map((id: string) => ({
            id,
          })),
        },
      },
      include: {
        translations: true,
        relatedProducts: true,
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { message: "Update failed" },
      { status: 500 }
    );
  }
}

// ================= DELETE =================
export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    await db.blog.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: "Blog deleted",
    });
  } catch {
    return NextResponse.json(
      { message: "Delete failed" },
      { status: 500 }
    );
  }
}