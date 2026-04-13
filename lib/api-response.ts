import { NextResponse } from "next/server";
import { ZodError } from "zod";

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
   ZOD ERROR HANDLER
================================ */

export function zodErrorResponse(error: ZodError) {
  return errorResponse("Validation failed", {
    status: 400,
    errors: error.flatten().fieldErrors,
  });
}

/* ================================
   TRY-CATCH WRAPPER (🔥 MAIN)
================================ */

export async function handleApi<T>(
  fn: () => Promise<T>
): Promise<NextResponse> {
  try {
    const data = await fn();

    return successResponse(data);
  } catch (error) {
    // Zod error
    if (error instanceof ZodError) {
      return zodErrorResponse(error);
    }

    // Normal error
    if (error instanceof Error) {
      return errorResponse(error.message);
    }

    return errorResponse();
  }
}