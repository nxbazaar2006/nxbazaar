import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateUniqueSlug } from "@/lib/generateUniqueSlug";
import { blogSchema } from "@/lib/validators/blog.schema";
import { Language } from "@prisma/client";

// ================= CREATE BLOG =================
export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const data = blogSchema.parse(body);

    // 🔥 slug per translation
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

    const blog = await db.blog.create({
      data: {
        imageUrl: data.imageUrl,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        content: data.content,
        userId: data.userId,
        categoryId: data.categoryId,
        publishedAt: data.publishedAt,

        translations: {
          create: translationsWithSlug,
        },

        relatedProducts: {
          connect: data.relatedProductIds?.map((id: string) => ({
            id,
          })),
        },
      },
      include: {
        translations: true,
        relatedProducts: true,
      },
    });

    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    console.error("CREATE_BLOG_ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to create blog",
      },
      { status: 500 }
    );
  }
}

// ================= GET ALL =================
export async function GET() {
  try {
    const blogs = await db.blog.findMany({
      include: {
        translations: true,
        category: true,
        relatedProducts: true,
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(blogs);
  } catch (error) {
    console.error("GET_BLOGS_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}