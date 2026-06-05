import type { BlogInput } from "@/lib/validators/blog.schema";

async function parseJsonResponse(response: Response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message ?? "Blog request failed");
  }

  return data;
}

export async function getBlogs() {
  const response = await fetch("/api/blogs");
  return parseJsonResponse(response);
}

export async function getBlogById(id: string) {
  const response = await fetch(`/api/blogs/${id}`);
  return parseJsonResponse(response);
}

export async function createBlog(data: BlogInput) {
  const response = await fetch("/api/blogs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return parseJsonResponse(response);
}

export async function updateBlog(id: string, data: BlogInput) {
  const response = await fetch(`/api/blogs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return parseJsonResponse(response);
}

export async function deleteBlog(id: string) {
  const response = await fetch(`/api/blogs/${id}`, {
    method: "DELETE",
  });

  return parseJsonResponse(response);
}
