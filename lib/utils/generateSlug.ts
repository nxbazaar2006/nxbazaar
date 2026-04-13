import { db } from "@/lib/db";
import { generateSlug as createSlug } from "./slug";

export async function generateUniqueSlug(base: string) {
  let baseSlug = createSlug(base);
  let slug = baseSlug;
  let count = 1;

  while (await db.blog.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${count++}`;
  }

  return slug;
}