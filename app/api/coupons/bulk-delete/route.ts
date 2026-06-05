import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getErrorMessage } from "@/lib/error-message"

export async function POST(request: Request) {
  try {
    const { ids } = await request.json()

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { message: "No IDs provided" },
        { status: 400 }
      )
    }

    await db.coupon.deleteMany({
      where: { id: { in: ids } },
    })

    return NextResponse.json({ message: "Deleted successfully" })
  } catch (error: unknown) {
    return NextResponse.json(
      { message: getErrorMessage(error, "Failed to delete coupons") },
      { status: 500 }
    )
  }
}
