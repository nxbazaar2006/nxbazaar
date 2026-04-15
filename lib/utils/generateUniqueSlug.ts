import { db } from "@/lib/db";
import { generateSlug } from "./slug";

type ModelType =
  | "blog"
  | "category"
  | "product"
  | "market"
  | "subCategory";

export async function generateUniqueSlug(
  base: string,
  model: ModelType
): Promise<string> {
  if (!base) return "item";

  const baseSlug = generateSlug(base.toLowerCase());
  let slug = baseSlug;
  let count = 1;

  // ✅ Type-safe model mapping
  const modelMap = {
    blog: db.blog,
    category: db.category,
    product: db.product,
    market: db.market,
    subCategory: db.subCategory,
  };

  const modelRef = modelMap[model];

  if (!modelRef) {
    throw new Error(`Invalid model: ${model}`);
  }

  // ✅ Safe loop (max limit)
  while (count < 100) {
    const exists = await modelRef.findUnique({
      where: { slug },
    });

    if (!exists) break;

    slug = `${baseSlug}-${count}`;
    count++;
  }

  return slug;
}