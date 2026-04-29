export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; message: string; errors?: unknown };

export function successResponse<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

export function errorResponse(
  message: string,
  errors?: unknown
): ApiResponse<null> {
  return { success: false, message, errors };
}