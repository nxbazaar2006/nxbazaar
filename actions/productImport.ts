"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { barcodeValueFromSku, getBarcodeImageUrl } from "@/lib/barcode";
import {
  generateProductCode,
  generateSku,
  productCodePrefix,
} from "@/lib/productCodeGeneration";
import { generateSlug } from "@/lib/generateSlug";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import * as XLSX from "xlsx";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_ROWS = 500;
const ACCEPTED_EXTENSIONS = [".csv", ".xlsx", ".xls"];

const optionalNumber = z.preprocess(
  (value: unknown) => (value === "" || value === null || value === undefined ? undefined : value),
  z.coerce.number().nonnegative().optional()
);

const optionalInteger = z.preprocess(
  (value: unknown) => (value === "" || value === null || value === undefined ? undefined : value),
  z.coerce.number().int().nonnegative().optional()
);

const importRowSchema = z.object({
  title: z.string().trim().min(1, "title is required"),
  category: z.string().trim().min(1, "category or categoryId is required"),
  subCategory: z.string().trim().optional().default(""),
  price: z.coerce.number().positive("price must be greater than 0"),
  salePrice: optionalNumber,
  costPrice: optionalNumber,
  color: z.string().trim().optional().default(""),
  size: z.string().trim().optional().default(""),
  stock: optionalInteger,
  description: z.string().trim().optional().default(""),
  imageUrl: z.string().trim().url("imageUrl must be a valid URL").optional().or(z.literal("")),
  tags: z.string().trim().optional().default(""),
  unit: z.string().trim().optional().default(""),
  isWholesale: z.string().trim().optional().default(""),
});

type ImportRow = z.infer<typeof importRowSchema>;

type ImportResult = {
  success: boolean;
  message: string;
  created?: number;
};

function normalize(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

function readValue(row: Record<string, unknown>, ...keys: string[]) {
  const entries = Object.entries(row);

  for (const key of keys) {
    const match = entries.find(([heading]) => normalize(heading) === normalize(key));

    if (match) return match[1];
  }

  return "";
}

function parseRow(row: Record<string, unknown>, index: number): ImportRow {
  const result = importRowSchema.safeParse({
    title: readValue(row, "title", "product title"),
    category: readValue(row, "categoryId", "category"),
    subCategory: readValue(row, "subCategoryId", "sub category", "subcategory"),
    price: readValue(row, "price", "retail price"),
    salePrice: readValue(row, "salePrice", "sale price"),
    costPrice: readValue(row, "costPrice", "cost price"),
    color: readValue(row, "color", "colour"),
    size: readValue(row, "size"),
    stock: readValue(row, "stock", "quantity"),
    description: readValue(row, "description"),
    imageUrl: readValue(row, "imageUrl", "image url"),
    tags: readValue(row, "tags"),
    unit: readValue(row, "unit"),
    isWholesale: readValue(row, "isWholesale", "is wholesale"),
  });

  if (!result.success) {
    const issue = result.error.issues[0];
    throw new Error(`Row ${index}: ${issue.path.join(".")} ${issue.message}`);
  }

  return result.data;
}

function parseBoolean(value: string) {
  return ["1", "true", "yes", "y"].includes(normalize(value));
}

function tagsFrom(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function mapEntity<T extends { id: string; translations: { title: string; slug: string | null }[] }>(
  entities: T[]
) {
  const map = new Map<string, T>();

  for (const entity of entities) {
    map.set(normalize(entity.id), entity);

    for (const translation of entity.translations) {
      map.set(normalize(translation.title), entity);
      if (translation.slug) map.set(normalize(translation.slug), entity);
    }
  }

  return map;
}

async function uniqueProductSlug(
  tx: Prisma.TransactionClient,
  title: string
) {
  const base = generateSlug(title);

  for (let counter = 0; counter < 1000; counter += 1) {
    const slug = counter === 0 ? base : `${base}-${counter}`;
    const [product, translation] = await Promise.all([
      tx.product.findUnique({ where: { slug }, select: { id: true } }),
      tx.productTranslation.findFirst({
        where: { locale: "EN", slug },
        select: { id: true },
      }),
    ]);

    if (!product && !translation) return slug;
  }

  throw new Error(`Unable to generate slug for "${title}"`);
}

export async function importProductsFromFile(formData: FormData): Promise<ImportResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return { success: false, message: "Please select a CSV or Excel file." };
    }

    const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;

    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      return { success: false, message: "Only .csv, .xlsx and .xls files are supported." };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { success: false, message: "File size must not exceed 5 MB." };
    }

    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    if (!sheet) {
      return { success: false, message: "The uploaded file does not contain a worksheet." };
    }

    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
      raw: false,
    });

    if (rawRows.length === 0) {
      return { success: false, message: "The uploaded file does not contain product rows." };
    }

    if (rawRows.length > MAX_ROWS) {
      return { success: false, message: `A maximum of ${MAX_ROWS} products can be imported at once.` };
    }

    const rows = rawRows.map((row, index) => parseRow(row, index + 2));
    const user = await db.user.findFirst({
      where: {
        OR: [
          { id: session.user.id },
          ...(session.user.email ? [{ email: session.user.email }] : []),
        ],
      },
      select: {
        id: true,
        role: true,
        profile: { select: { username: true } },
        sellerProfile: { select: { code: true } },
      },
    });

    if (!user) {
      return { success: false, message: "Logged-in user was not found. Please sign in again." };
    }

    const [categories, subCategories] = await Promise.all([
      db.category.findMany({
        select: { id: true, translations: { select: { title: true, slug: true } } },
      }),
      db.subCategory.findMany({
        select: {
          id: true,
          categoryId: true,
          hsnCodeId: true,
          hsnCode: { select: { gstRate: true } },
          translations: { select: { title: true, slug: true } },
        },
      }),
    ]);
    const categoryMap = mapEntity(categories);
    const subCategoryMap = mapEntity(subCategories);
    const vendorCode = user.sellerProfile?.code ?? user.id;

    await db.$transaction(
      async (tx) => {
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext('nxbazaar-product-import'))`;
        let skuSerial = 1;
        const reservedProductCodes = new Set<string>();

        for (const [index, row] of rows.entries()) {
          const rowNumber = index + 2;
          const category = categoryMap.get(normalize(row.category));

          if (!category) {
            throw new Error(`Row ${rowNumber}: category "${row.category}" was not found.`);
          }

          const subCategory = row.subCategory
            ? subCategoryMap.get(normalize(row.subCategory))
            : undefined;

          if (row.subCategory && !subCategory) {
            throw new Error(`Row ${rowNumber}: subcategory "${row.subCategory}" was not found.`);
          }

          if (subCategory && subCategory.categoryId !== category.id) {
            throw new Error(`Row ${rowNumber}: subcategory does not belong to selected category.`);
          }

          const codePrefix = productCodePrefix({
            vendorCode,
            productTitle: row.title,
          });
          const existingCodes = await tx.product.findMany({
            where: {
              productCode: {
                startsWith: `${codePrefix}-`,
              },
            },
            select: { productCode: true },
          });
          let productSerial = existingCodes.reduce((max, product) => {
            const productCode = product.productCode ?? "";
            const suffix = productCode.slice(codePrefix.length + 1);

            return /^\d{3}$/.test(suffix)
              ? Math.max(max, Number(suffix))
              : max;
          }, 0);
          let productCode = "";

          do {
            productSerial += 1;
            productCode = generateProductCode({
              vendorCode,
              productTitle: row.title,
              number: productSerial,
            });
          } while (reservedProductCodes.has(productCode));

          reservedProductCodes.add(productCode);
          const slug = await uniqueProductSlug(tx, row.title);
          const subCategoryLabel =
            subCategory?.translations[0]?.slug ??
            subCategory?.translations[0]?.title ??
            subCategory?.id ??
            "SUB";
          let sku = "";

          for (let attempts = 0; attempts < 1000; attempts += 1) {
            sku = generateSku({
              vendorCode,
              productTitle: row.title,
              subCategory: subCategoryLabel,
              color: row.color || "CLR",
              size: row.size || "SIZE",
              number: skuSerial++,
            });
            const existing = await tx.productVariant.findUnique({
              where: { sku },
              select: { id: true },
            });

            if (!existing) break;
            sku = "";
          }

          if (!sku) {
            throw new Error(`Row ${rowNumber}: unable to generate a unique SKU.`);
          }

          const barcode = barcodeValueFromSku(sku);
          const attributes = [
            ...(row.color ? [{ name: "color", value: row.color }] : []),
            ...(row.size ? [{ name: "size", value: row.size }] : []),
          ];
          const product = await tx.product.create({
            data: {
              title: row.title,
              slug,
              productCode,
              imageUrl: row.imageUrl || null,
              tags: tagsFrom(row.tags),
              unit: row.unit || null,
              isActive: true,
              isWholesale: parseBoolean(row.isWholesale),
              currency: "INR",
              gstRate: subCategory?.hsnCode?.gstRate ?? null,
              categoryId: category.id,
              subCategoryId: subCategory?.id ?? null,
              hsnCodeId: subCategory?.hsnCodeId ?? null,
              userId: user.id,
              images: row.imageUrl
                ? { create: [{ url: row.imageUrl, isPrimary: true }] }
                : undefined,
              translations: {
                create: [{ locale: "EN", title: row.title, description: row.description || null, slug }],
              },
              variants: {
                create: [
                  {
                    title: row.color || row.size ? [row.color, row.size].filter(Boolean).join(" / ") : "Default Variant",
                    sku,
                    barcode,
                    barcodeUrl: getBarcodeImageUrl(barcode),
                    productCode,
                    price: row.price,
                    salePrice: row.salePrice ?? null,
                    costPrice: row.costPrice ?? null,
                    currency: "INR",
                    stock: row.stock ?? null,
                    isActive: true,
                    isDefault: true,
                    attributes: attributes.length ? { create: attributes } : undefined,
                  },
                ],
              },
            },
            select: {
              id: true,
              variants: { select: { id: true, sku: true } },
            },
          });

          await tx.productHistory.create({
            data: {
              productId: product.id,
              productCode,
              productTitle: row.title,
              action: "CREATE",
              field: "product",
              newValue: JSON.stringify({ source: "CSV_EXCEL_IMPORT", productCode, sku }),
              variantId: product.variants[0]?.id ?? null,
              sku,
              changedByUserId: user.id,
              changedByUserCode: user.profile?.username ?? user.id,
              changedByRole: user.role,
              sellerCode: user.sellerProfile?.code ?? null,
            },
          });
        }
      },
      { maxWait: 10_000, timeout: 120_000 }
    );

    revalidatePath("/dashboard/products");

    return {
      success: true,
      created: rows.length,
      message: `${rows.length} product${rows.length === 1 ? "" : "s"} imported successfully.`,
    };
  } catch (error) {
    console.error("PRODUCT_IMPORT_ERROR", error);

    return {
      success: false,
      message: error instanceof Error ? error.message : "Product import failed.",
    };
  }
}
