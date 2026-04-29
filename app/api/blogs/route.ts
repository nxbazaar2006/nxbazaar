import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateUniqueSlug } from "@/lib/generateUniqueSlug";
import { blogSchema } from "@/lib/validators/blog.schema";

// ================= CREATE BLOG =================
export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const data = blogSchema.parse(body);

    const title = data.translations[0]?.title;

    if (!title) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 }
      );
    }

    const slug = await generateUniqueSlug("blog", title);

    const blog = await db.blog.create({
      data: {
        slug,
        imageUrl: data.imageUrl,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        content: data.content,
        userId: data.userId,
        categoryId: data.categoryId,
        publishedAt: data.publishedAt,

        translations: {
          create: data.translations,
        },

        // 🔥 related products (many-to-many)
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
  } catch {
    return NextResponse.json(
      { message: "Failed to create blog" },
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
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}