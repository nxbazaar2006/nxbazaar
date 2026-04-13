import { ZodError } from "zod"
import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"

export function handleApiError(error: unknown) {
  console.error("API ERROR:", error)

  // ✅ 1. ZOD VALIDATION ERROR
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        message: "Validation failed",
        errors: error.flatten(), // { fieldErrors }
      },
      { status: 422 }
    )
  }

  // ✅ 2. PRISMA ERROR (DB errors)
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    let message = "Database error"

    // 🔥 UNIQUE CONSTRAINT (duplicate slug, email, etc.)
    if (error.code === "P2002") {
      message = "Duplicate field value (already exists)"
    }

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 400 }
    )
  }

  // ✅ 3. CUSTOM / NORMAL ERROR
  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 400 }
    )
  }

  // ❌ 4. UNKNOWN ERROR (fallback)
  return NextResponse.json(
    {
      success: false,
      message: "Internal Server Error",
    },
    { status: 500 }
  )
}