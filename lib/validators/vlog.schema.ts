import { z } from "zod";

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

export const vlogSchema = z
  .object({
    productId: z.preprocess(emptyToUndefined, z.string().optional()),
    userId: z.preprocess(emptyToUndefined, z.string().optional()),
    blogId: z.preprocess(emptyToUndefined, z.string().optional()),

    translations: z
      .array(
        z.object({
          locale: z.preprocess(
            (v) => (typeof v === "string" ? v.toUpperCase() : v),
            z.enum(["EN", "HI", "MR"])
          ),
          title: z.string().min(2),
          slug: z.preprocess(emptyToUndefined, z.string().optional()),
        })
      )
      .min(1),
  })
  .refine(
    (data) => data.productId || data.blogId || data.userId,
    {
      message:
        "At least one relation (productId, blogId, userId) is required",
    }
  );

export type VlogInput = z.infer<typeof vlogSchema>;