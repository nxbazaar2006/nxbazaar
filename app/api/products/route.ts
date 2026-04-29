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
<<<<<<< HEAD
=======

/* ================= CREATE ================= */

export async function POST(request: Request): Promise<Response> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const json = await request.json();
    const body = productSchema.parse(json);

    /* ================= SLUG ================= */

    const slug =
      body.slug ||
      `${slugify(body.title, { lower: true, strict: true })}-${Date.now()}`;

    /* ================= DUPLICATE SLUG ================= */

    const existingProduct = await db.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      return NextResponse.json(
        { message: `Product (${body.title}) already exists` },
        { status: 409 }
      );
    }

    /* ================= CREATE PRODUCT ================= */

    const product = await db.product.create({
      data: {
        title: body.title,
        slug,

        imageUrl: body.imageUrl ?? null,

        tags: body.tags ?? [],
        unit: body.unit ?? null,

        currency: body.currency ?? "INR",

        isActive: body.isActive ?? true,
        isWholesale: body.isWholesale ?? false,

        /* ================= RELATIONS ================= */

        user: {
          connect: { id: session.user.id },
        },

        category: {
          connect: { id: body.categoryId },
        },

        subCategory: body.subCategoryId
          ? {
              connect: { id: body.subCategoryId },
            }
          : undefined,

        hsnCode: body.hsnCodeId
          ? {
              connect: { id: body.hsnCodeId },
            }
          : undefined,

        /* ================= IMAGES ================= */

        images: {
          create: body.images.map((img) => ({
            url: img.url,
            isPrimary: img.isPrimary ?? false,
          })),
        },

        /* ================= VARIANTS ================= */

        variants: {
          create: body.variants.map((variant) => ({
            title: variant.title,

            sku: variant.sku ?? null,
            barcode: variant.barcode ?? null,
            productCode: variant.productCode ?? null,

            price: variant.price,
            salePrice: variant.salePrice ?? null,
            costPrice: variant.costPrice ?? null,

            currency: body.currency ?? "INR",

            stock: variant.stock ?? null,
            reservedStock: 0,
            lowStockAlert: null,
            trackInventory: true,

            image: variant.image ?? null,

            isActive: true,
            isDefault: variant.isDefault ?? false,

            attributes: {
              create: variant.attributes.map((attr) => ({
                name: attr.name,
                value: attr.value,
              })),
            },

            wholesalePricing: {
              create: variant.wholesalePricing.map((w) => ({
                minQty: w.minQty,
                price: w.price,
              })),
            },
          })),
        },

        /* ================= TRANSLATIONS ================= */

        translations: {
          create: body.translations.map((translation) => ({
            locale: translation.locale,
            title: translation.title,
            description: translation.description ?? null,
          })),
        },
      },

      include: {
        category: true,
        subCategory: true,
        hsnCode: true,
        user: true,

        images: true,

        variants: {
          include: {
            attributes: true,
            wholesalePricing: true,
          },
        },

        translations: true,
      },
    });

    return NextResponse.json(product);
  } catch (error: unknown) {
    console.error("CREATE PRODUCT ERROR ❌", error);

    return NextResponse.json(
      {
        message: "Failed to create product",
      },
      { status: 500 }
    );
  }
}
>>>>>>> 5cea87c5237b5e7bbd98e5f2766d0573faa130c1
