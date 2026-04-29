"use server";

import { db } from "@/lib/db";
import { blogSchema } from "@/lib/validators/blog.schema";
import { generateUniqueSlug } from "@/lib/generateUniqueSlug";

export async function createBlog(data: unknown) {
  const parsed = blogSchema.parse(data);

  const title = parsed.translations[0]?.title;
  const slug = await generateUniqueSlug("blog", title);

  return db.blog.create({
    data: {
      slug,
      content: parsed.content,
      userId: parsed.userId,
      categoryId: parsed.categoryId,
      translations: { create: parsed.translations },
      relatedProducts: {
        connect: parsed.relatedProductIds?.map((id) => ({ id })),
      },
    },
  });
}