import {db} from "@/lib/db";
import { NextResponse } from "next/server";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;
    const orders = await db.order.findMany({
      where: {
        userId: id, // ✅ FIX: findMany instead of findUnique
      },
      include: {
        orderItems: true,
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to Fetch Orders", error },
      { status: 500 }
    );
  }
}
