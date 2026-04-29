import { ZodError } from "zod";

export function handleError(error: unknown): {
  message: string;
  errors?: unknown;
} {
  if (error instanceof ZodError) {
    return {
      message: "Validation error",
      errors: error.flatten(),
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return { message: "Something went wrong" };
}