"use server";

import { db } from "@/lib/db";
import { blogSchema } from "@/lib/validators/blog.schema";
import { generateUniqueSlug } from "@/lib/generateUniqueSlug";

export async function createBlog(data: unknown) {
  const parsed = blogSchema.parse(data);

  // 🔥 generate slug per translation
  const translationsWithSlug = await Promise.all(
    parsed.translations.map(async (t) => ({
      ...t,
      slug: await generateUniqueSlug(
        "blog",
        t.locale,
        t.slug ?? t.title
      ),
    }))
  );

  const blog = await db.blog.create({
    data: {
      content: parsed.content,
      userId: parsed.userId,
      categoryId: parsed.categoryId,

      translations: {
        create: translationsWithSlug,
      },

      relatedProducts: {
        connect: parsed.relatedProductIds?.map((id) => ({
          id,
        })),
      },
    },
  });

  return blog;
}