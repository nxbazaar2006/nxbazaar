import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { z } from "zod";

/* ================= SORT FIELDS (STRICT) ================= */
const SORT_FIELDS = ["createdAt", "title"] as const;
type SortField = (typeof SORT_FIELDS)[number];

/* ================= QUERY VALIDATION ================= */
const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  search: z.string().optional().default(""),
  categoryId: z.string().optional(),
  isActive: z.enum(["true", "false"]).optional(),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
});

/* ================= TYPE GUARD ================= */
function isSortField(value: string): value is SortField {
  return SORT_FIELDS.includes(value as SortField);
}

/* ================= WHERE BUILDER ================= */
function buildWhere(input: z.infer<typeof querySchema>): Prisma.ProductWhereInput {
  const filters: Prisma.ProductWhereInput[] = [];

  if (input.search) {
    filters.push({
      OR: [
        {
          title: {
            contains: input.search,
            mode: "insensitive",
          },
        },
        {
          slug: {
            contains: input.search,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (input.categoryId) {
    filters.push({ categoryId: input.categoryId });
  }

  if (input.isActive) {
    filters.push({ isActive: input.isActive === "true" });
  }

  return filters.length ? { AND: filters } : {};
}

/* ================= API ================= */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const parsed = querySchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      search: searchParams.get("search"),
      categoryId: searchParams.get("categoryId"),
      isActive: searchParams.get("isActive"),
      sort: searchParams.get("sort"),
      order: searchParams.get("order"),
    });

    const { page, limit, order } = parsed;
    const skip = (page - 1) * limit;

    /* ================= SAFE SORT ================= */
    const sortField: SortField = isSortField(parsed.sort ?? "")
      ? parsed.sort
      : "createdAt";

    const where = buildWhere(parsed);

    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      [sortField]: order,
    };

    /* ================= QUERY ================= */
    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          images: true,
          variants: true,
          translations: true,
        },
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
