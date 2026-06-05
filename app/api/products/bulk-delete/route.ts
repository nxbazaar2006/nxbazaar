import { NextResponse } from "next/server";
import { z } from "zod";
import { bulkDeleteProduct } from "@/actions/product";

const schema = z.object({
  ids: z.array(z.string()).min(1),
});

async function bulkDeleteProducts(req: Request) {
  try {
    const body: unknown = await req.json();
    const { ids } = schema.parse(body);

    const result = await bulkDeleteProduct(ids);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error || "Bulk delete failed",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        result.data.blockedIds.length > 0
          ? `${result.data.deletedIds.length} product(s) deleted. ${result.data.blockedIds.length} product(s) are used in orders or sales and were skipped.`
          : "Products deleted successfully",
      data: result.data,
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product IDs",
          error: (error as Error).message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Bulk delete failed",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return bulkDeleteProducts(req);
}

export async function DELETE(req: Request) {
  return bulkDeleteProducts(req);
}
