import { z } from "zod";

export const blogSchema = z.object({
  slug: z.string().min(3),
  imageUrl: z.string().optional(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  content: z.unknown(),
  userId: z.string(),
  categoryId: z.string().optional(),

  translations: z.array(
    z.object({
      locale: z.enum(["en", "hi", "mr"]),
      title: z.string().min(3),
      description: z.string().optional(),
    })
  ),
});

export type BlogInput = z.infer<typeof blogSchema>;