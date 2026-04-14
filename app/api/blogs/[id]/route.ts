import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { blogSchema } from "@/lib/validators/blog.schema";
import { generateUniqueSlug } from "@/lib/utils/generateSlug";
import { auth } from "@/auth";

/* ================================
   GET SINGLE BLOG
================================ */

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const blog = await db.blog.findUnique({
      where: { id },
      include: {
        translations: true,
        category: true,
        relatedProducts: true,
      },
    });

    if (!blog) {
      return NextResponse.json(
        { success: false, message: "Blog not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Blog fetched successfully",
      data: blog,
    });
  } catch (error) {
    console.error("BLOG_SINGLE_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch blog",
      },
      { status: 500 }
    );
  }
}

/* ================================
   UPDATE BLOG
================================ */

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    const body = await req.json();
    const validated = blogSchema.parse(body);

    const existing = await db.blog.findUnique({
      where: { id },
      select: { slug: true, userId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Blog not found" },
        { status: 404 }
      );
    }

    const userId = validated.userId || session?.user?.id || existing.userId;

    let slug = validated.slug;

    if (validated.slug !== existing.slug) {
      slug = await generateUniqueSlug(validated.slug);
    }

    const blog = await db.blog.update({
      where: { id },
      data: {
        slug,
        imageUrl: validated.imageUrl,
        isActive: validated.isActive,
        isFeatured: validated.isFeatured,
        content: validated.content,
        userId,
        category: validated.categoryId
          ? {
              connect: { id: validated.categoryId },
            }
          : {
              disconnect: true,
            },

        translations: {
          deleteMany: {},
          create: validated.translations.map((translation) => ({
            ...translation,
            locale: translation.locale.toUpperCase() as any,
          })),
        },
      },
      include: {
        translations: true,
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Blog updated successfully",
      data: blog,
    });
  } catch (error) {
    console.error("BLOG_UPDATE_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update blog",
      },
      { status: 400 }
    );
  }
}

/* ================================
   DELETE BLOG
================================ */

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await db.blog.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Blog not found" },
        { status: 404 }
      );
    }

    await db.blog.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Blog deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error("BLOG_DELETE_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete blog",
      },
      { status: 400 }
    );
  }
}
