import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { productSchema } from "@/lib/validators/productSchema";
import { auth } from "@/auth";
import slugify from "slugify";

/* ================= GET ================= */

export async function GET() {
  try {
    const products = await db.product.findMany({
      orderBy: { createdAt: "desc" },

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

    return NextResponse.json(products);
  } catch (error) {
    console.error("GET PRODUCTS ERROR ❌", error);

    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

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