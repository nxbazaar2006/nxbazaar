type ActionLike<T> =
  | { success: true; data: T }
  | { success: false; error?: string; message?: string };

export async function unwrap<T>(promise: Promise<ActionLike<T>>): Promise<T> {
  const response = await promise;

  if (response.success) {
    return response.data;
  }

  throw new Error(response.error ?? response.message ?? "Request failed");
}
