"use server";

import { db } from "@/lib/db";
import { blogSchema } from "@/lib/validators/blog.schema";
import { generateUniqueSlug } from "@/lib/generateUniqueSlug";
import { auth } from "@/auth";
import { Language } from "@prisma/client";

export async function createBlog(data: unknown) {
  const parsed = blogSchema.parse(data);
  const session = await auth();
  const userId = parsed.userId ?? session?.user?.id;

  if (!userId) {
    throw new Error("User ID is required");
  }

  // 🔥 generate slug per translation
  const translationsWithSlug = await Promise.all(
    parsed.translations.map(async (t: (typeof parsed.translations)[number]) => {
      const locale = t.locale.toUpperCase() as Language;

      return {
        ...t,
        locale,
        slug: await generateUniqueSlug(
          "blog",
          locale,
          t.slug ?? t.title
        ),
      };
    })
  );

  const blog = await db.blog.create({
    data: {
      slug: parsed.slug ?? translationsWithSlug[0]?.slug ?? "blog",
      content: parsed.content,
      userId,
      categoryId: parsed.categoryId,

      translations: {
        create: translationsWithSlug,
      },

      relatedProducts: {
        connect: parsed.relatedProductIds?.map((id: string) => ({
          id,
        })),
      },
    },
  });

  return blog;
}
