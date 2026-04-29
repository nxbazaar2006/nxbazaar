import { z } from "zod";

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

export const vlogSchema = z.object({
  title: z.string().min(3),
  productId: z.preprocess(emptyToUndefined, z.string().optional()),
  userId: z.preprocess(emptyToUndefined, z.string().optional()),
  blogId: z.preprocess(emptyToUndefined, z.string().optional()),
  translations: z
    .array(
      z.object({
        locale: z.preprocess((v) => (typeof v === "string" ? v.toLowerCase() : v), z.enum(["en", "hi", "mr"])),
        title: z.string().min(2),
        slug: z.string().min(2),
      })
    )
    .min(1),
});

export type VlogInput = z.infer<typeof vlogSchema>;
