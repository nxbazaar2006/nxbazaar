import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

/* ================================
   TYPES
================================ */

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface ApiError {
  success: false;
  data: null;
  message: string;
  errors?: Record<string, string[]>;
}

/* ================================
   CUSTOM ERROR (🔥)
================================ */

export class AppError extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode = 400,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

/* ================================
   SUCCESS RESPONSE
================================ */

export function successResponse<T>(
  data: T,
  message = "Success",
  options?: {
    status?: number;
    meta?: ApiSuccess<T>["meta"];
  }
) {
  return NextResponse.json<ApiSuccess<T>>(
    {
      success: true,
      data,
      message,
      meta: options?.meta,
    },
    { status: options?.status ?? 200 }
  );
}

/* ================================
   ERROR RESPONSE
================================ */

export function errorResponse(
  message = "Something went wrong",
  options?: {
    status?: number;
    errors?: Record<string, string[]>;
  }
) {
  return NextResponse.json<ApiError>(
    {
      success: false,
      data: null,
      message,
      errors: options?.errors,
    },
    { status: options?.status ?? 500 }
  );
}

/* ================================
   MAIN HANDLER (🔥 UPGRADED)
================================ */

export async function handleApi<T>(
  fn: () => Promise<T>,
  options?: {
    successMessage?: string;
    successStatus?: number;
  }
): Promise<NextResponse> {
  try {
    const data = await fn();

    return successResponse(
      data,
      options?.successMessage || "Success",
      { status: options?.successStatus }
    );

  } catch (error: unknown) {
    console.error("API ERROR:", error);

    /* 🔥 ZOD ERROR */
    if (error instanceof ZodError) {
      return errorResponse("Validation failed", {
        status: 422,
        errors: error.flatten().fieldErrors,
      });
    }

    /* 🔥 PRISMA ERROR */
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      let message = "Database error";
      let status = 400;

      if (error.code === "P2002") {
        message = "Duplicate field value";
      }

      if (error.code === "P2025") {
        message = "Record not found";
        status = 404;
      }

      return errorResponse(message, { status });
    }

    /* 🔥 CUSTOM ERROR */
    if (error instanceof AppError) {
      return errorResponse(error.message, {
        status: error.statusCode,
        errors: error.errors,
      });
    }

    /* 🔥 NORMAL ERROR */
    if (error instanceof Error) {
      return errorResponse(error.message, { status: 400 });
    }

    return errorResponse("Internal Server Error", { status: 500 });
  }
}