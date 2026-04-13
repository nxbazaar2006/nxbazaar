import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { blogSchema } from "@/lib/validators/blog.schema";
import { generateUniqueSlug } from "@/lib/utils/generateSlug";

/* ================================
   GET SINGLE BLOG
================================ */

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const blog = await db.blog.findUnique({
      where: { id: params.id },
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
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const validated = blogSchema.parse(body);

    const existing = await db.blog.findUnique({
      where: { id: params.id },
      select: { slug: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Blog not found" },
        { status: 404 }
      );
    }

    let slug = validated.slug;

    if (validated.slug !== existing.slug) {
      slug = await generateUniqueSlug(validated.slug);
    }

    const blog = await db.blog.update({
      where: { id: params.id },
      data: {
        ...validated,
        slug,

        translations: {
          deleteMany: {},
          create: validated.translations,
        },

        ...(validated.categoryId && {
          category: {
            connect: { id: validated.categoryId },
          },
        }),
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
  { params }: { params: { id: string } }
) {
  try {
    const existing = await db.blog.findUnique({
      where: { id: params.id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Blog not found" },
        { status: 404 }
      );
    }

    await db.blog.delete({
      where: { id: params.id },
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