import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { blogSchema } from "@/lib/validators/blog.schema";
import { generateUniqueSlug } from "@/lib/utils/generateSlug";

/* ================================
   GET BLOGS (LIST + FILTER + PAGINATION)
================================ */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") ?? "1");
    const limit = Number(searchParams.get("limit") ?? "10");
    const search = searchParams.get("search") ?? "";
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        translations: {
          some: {
            title: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        },
      }),
    };

    const [blogs, total] = await Promise.all([
      db.blog.findMany({
        where,
        include: {
          translations: true,
          category: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),

      db.blog.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Blogs fetched successfully",
      data: blogs,
      meta: {
        page,
        limit,
        total,
      },
    });
  } catch (error) {
    console.error("BLOG_GET_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch blogs",
        data: [],
      },
      { status: 500 }
    );
  }
}

/* ================================
   CREATE BLOG
================================ */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = blogSchema.parse(body);

    const slug = await generateUniqueSlug(validated.slug);

    const blog = await db.blog.create({
      data: {
        ...validated,
        slug,

        translations: {
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
      message: "Blog created successfully",
      data: blog,
    });
  } catch (error) {
    console.error("BLOG_CREATE_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create blog",
      },
      { status: 400 }
    );
  }
}