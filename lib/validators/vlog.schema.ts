import { z } from "zod";

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

export const vlogSchema = z.object({
    title: z.string().trim().min(2, "Vlog title is required"),
    productId: z.preprocess(emptyToUndefined, z.string().optional()),
    userId: z.preprocess(emptyToUndefined, z.string().optional()),
    blogId: z.preprocess(emptyToUndefined, z.string().optional()),

    translations: z
      .array(
        z.object({
          locale: z.preprocess(
            (v: unknown) => (typeof v === "string" ? v.toUpperCase() : v),
            z.enum(["EN", "HI", "MR"])
          ),
          title: z.string().min(2),
          slug: z.preprocess(emptyToUndefined, z.string().optional()),
        })
      )
      .min(1),
  });

export type VlogInput = z.infer<typeof vlogSchema>;
