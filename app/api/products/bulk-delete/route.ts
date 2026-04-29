import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  ids: z.array(z.string()).min(1),
});

export async function DELETE(req: Request) {
  try {
    const body: unknown = await req.json();
    const { ids } = schema.parse(body);

    await db.product.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Bulk delete failed" },
      { status: 500 }
    );
  }
}