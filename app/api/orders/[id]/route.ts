import {db} from "@/lib/db";
import { NextResponse } from "next/server";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// ✅ GET SINGLE ORDER
export async function GET(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;
    const order = await db.order.findUnique({
      where: { id },
      include: { orderItems: true },
    });

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to Fetch Order", error },
      { status: 500 }
    );
  }
}

// ✅ DELETE ORDER
export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;
    const existingOrder = await db.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { message: "Order Not Found" },
        { status: 404 }
      );
    }

    const deletedOrder = await db.order.delete({
      where: { id },
    });

    return NextResponse.json(deletedOrder);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to Delete Order", error },
      { status: 500 }
    );
  }
}
