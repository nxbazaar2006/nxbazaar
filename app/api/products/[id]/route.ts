import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { productSchema } from "@/lib/validators/productSchema";
import { updateProduct } from "@/actions/product";
import { z } from "zod";

/* ================= TYPES ================= */
type Params = Promise<{ id: string }>;

/* ================= GET ================= */
export async function GET(
  _req: Request,
  { params }: { params: Params }
) {
  const { id } = await params; // ✅ FIX

  if (!id) {
    return NextResponse.json(
      { error: "Invalid ID" },
      { status: 400 }
    );
  }

  const product = await db.product.findUnique({
    where: { id },
    include: {
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

  if (!product) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(product);
}

/* ================= PUT ================= */
export async function PUT(
  req: Request,
  { params }: { params: Params }
) {
  try {
    const { id } = await params; // ✅ FIX

    if (!id) {
      return NextResponse.json(
        { error: "Invalid ID" },
        { status: 400 }
      );
    }

    const body: unknown = await req.json();
    const parsed = productSchema.parse(body);

    const updated = await updateProduct(id, parsed);

    if (!updated.success) {
      return NextResponse.json(
        { error: updated.error },
        { status: 400 }
      );
    }

    return NextResponse.json(updated.data);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Update failed" },
      { status: 500 }
    );
  }
}

/* ================= DELETE ================= */
export async function DELETE(
  _req: Request,
  { params }: { params: Params }
) {
  try {
    const { id } = await params; // ✅ FIX

    if (!id) {
      return NextResponse.json(
        { error: "Invalid ID" },
        { status: 400 }
      );
    }

    await db.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }
}
