import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogSchema } from "@/lib/validators/blog.schema";
import { generateUniqueSlug } from "@/lib/generateUniqueSlug";
import { Language } from "@prisma/client";

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
  } catch (error) {
    console.error("GET_BLOG_ERROR:", error);

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

    // 🔥 generate slug per translation
    const translationsWithSlug = await Promise.all(
      data.translations.map(async (t) => ({
        ...t,
        locale: t.locale.toUpperCase() as Language,
        slug: await generateUniqueSlug(
          "blog",
          t.locale,
          t.slug ?? t.title
        ),
      }))
    );

    const updated = await db.blog.update({
      where: { id: params.id },
      data: {
        imageUrl: data.imageUrl,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        content: data.content,
        categoryId: data.categoryId,
        publishedAt: data.publishedAt,

        translations: {
          deleteMany: {},
          create: translationsWithSlug,
        },

        relatedProducts: {
          set:
            data.relatedProductIds?.map((id: string) => ({
              id,
            })) ?? [],
        },
      },
      include: {
        translations: true,
        relatedProducts: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("UPDATE_BLOG_ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Update failed",
      },
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
  } catch (error) {
    console.error("DELETE_BLOG_ERROR:", error);

    return NextResponse.json(
      { message: "Delete failed" },
      { status: 500 }
    );
  }
}