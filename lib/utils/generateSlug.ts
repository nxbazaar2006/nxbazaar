import { db } from "@/lib/db";
import { generateSlug } from "./slug";

type ModelType = "blog" | "category" | "product" | "market" | "subCategory" ;

export async function generateUniqueSlug(
  base: string,
  model: ModelType
) {
  const baseSlug = generateSlug(base);
  let slug = baseSlug;
  let count = 1;

  // dynamic model access
  const modelRef = db[model];

  if (!modelRef) {
    throw new Error(`Invalid model: ${model}`);
  }

  while (await modelRef.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${count++}`;
  }

  return slug;
}