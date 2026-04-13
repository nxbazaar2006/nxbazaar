import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { updateProductSchema } from "@/lib/validators/productSchema";
import { ZodError } from "zod";
import { auth } from "@/auth";

/* ================= GET SINGLE PRODUCT ================= */

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { message: "Invalid product id" },
        { status: 400 }
      );
    }

    const product = await db.product.findUnique({
      where: { id },

      include: {
        category: true,
        subCategory: true,
        hsnCode: true,
        user: true,

        images: {
          orderBy: {
            isPrimary: "desc",
          },
        },

        variants: {
          include: {
            attributes: true,
            wholesalePricing: {
              orderBy: {
                minQty: "asc",
              },
            },
          },

          orderBy: {
            isDefault: "desc",
          },
        },

        translations: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("GET PRODUCT ERROR ❌", error);

    return NextResponse.json(
      { message: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

/* ================= UPDATE PRODUCT ================= */

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Invalid product id" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const validatedData = updateProductSchema.parse(body);

    /* ================= UPDATE ================= */

    const updatedProduct = await db.product.update({
      where: { id },

      data: {
        title: validatedData.title,
        imageUrl: validatedData.imageUrl ?? null,

        tags: validatedData.tags ?? [],
        unit: validatedData.unit ?? null,

        isActive: validatedData.isActive ?? true,
        isWholesale: validatedData.isWholesale ?? false,

        categoryId: validatedData.categoryId,
        subCategoryId: validatedData.subCategoryId ?? null,
        hsnCodeId: validatedData.hsnCodeId ?? null,

        /* ---------- images ---------- */
        images: {
          deleteMany: {},
          create: validatedData.images.map((img) => ({
            url: img.url,
            isPrimary: img.isPrimary ?? false,
          })),
        },

        /* ---------- variants ---------- */
        variants: {
          deleteMany: {},
          create: validatedData.variants.map((variant) => ({
            title: variant.title,

            sku: variant.sku ?? null,
            barcode: variant.barcode ?? null,

            price: variant.price,
            salePrice: variant.salePrice ?? null,
            costPrice: variant.costPrice ?? null,

            currency: validatedData.currency ?? "INR",

            stock: variant.stock ?? null,

            image: variant.image ?? null,

            isDefault: variant.isDefault ?? false,
            isActive: true,

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

        /* ---------- translations ---------- */
        translations: {
          deleteMany: {},
          create: validatedData.translations.map((translation) => ({
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

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("UPDATE ERROR ❌", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: error.flatten(),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Update failed" },
      { status: 500 }
    );
  }
}