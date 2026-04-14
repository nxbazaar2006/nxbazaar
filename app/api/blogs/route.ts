import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { blogSchema } from "@/lib/validators/blog.schema";
import { generateUniqueSlug } from "@/lib/utils/generateSlug";
import { auth } from "@/auth";

/* ================================
   GET BLOGS (LIST + FILTER + PAGINATION)
================================ */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") ?? "1");
    const limit = Number(searchParams.get("limit") ?? "10");
    const search = searchParams.get("search") ?? "";
    const locale = searchParams.get("locale")?.toUpperCase();
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
          translations: locale
            ? { where: { locale: locale as any } }
            : true,
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
    const session = await auth();
    const body = await req.json();
    const validated = blogSchema.parse(body);

    const slug = await generateUniqueSlug(validated.slug);
    const userId = validated.userId || session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const blog = await db.blog.create({
      data: {
        slug,
        imageUrl: validated.imageUrl,
        isActive: validated.isActive,
        isFeatured: validated.isFeatured,
        content: validated.content,
        userId,
        ...(validated.categoryId
          ? {
              category: {
                connect: { id: validated.categoryId },
              },
            }
          : {}),

        translations: {
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
