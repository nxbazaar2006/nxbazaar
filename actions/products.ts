"use server";

import { db } from "@/lib/db";

type ProductDetail = Awaited<ReturnType<typeof getProductBySlug>>;

function englishTranslation<
  T extends { locale: string; title: string; description?: string | null }
>(translations: T[]) {
  return (
    translations.find((translation) => translation.locale === "EN") ??
    translations.find((translation) => translation.locale.toUpperCase() === "EN") ??
    translations[0] ??
    null
  );
}

function mapProduct(product: {
  id: string;
  title: string;
  slug: string;
  userId: string;
  categoryId: string;
  imageUrl?: string | null;
  isWholesale: boolean;
  images: { url: string; isPrimary: boolean }[];
  translations: {
    locale: string;
    title: string;
    description: string | null;
    metaDescription?: string | null;
  }[];
  variants: {
    id: string;
    title: string;
    sku: string | null;
    productCode: string | null;
    price: number;
    salePrice: number | null;
    stock: number | null;
    image: string | null;
    isDefault: boolean;
    wholesalePricing: { minQty: number; price: number }[];
  }[];
}) {
  const translation = englishTranslation(product.translations);
  const variant =
    product.variants.find((item) => item.isDefault) ?? product.variants[0];
  const primaryImage =
    product.images.find((image) => image.isPrimary)?.url ??
    product.images[0]?.url ??
    product.imageUrl ??
    "";
  const wholesaleTier = variant?.wholesalePricing[0];

  return {
    ...product,
    title: translation?.title ?? product.title,
    description: translation?.description ?? "",
    metaDescription: translation?.metaDescription ?? translation?.description ?? "",
    imageUrl: primaryImage,
    productImages: product.images.map((image) => image.url),
    sku: variant?.sku ?? "",
    productCode: variant?.productCode ?? "",
    productPrice: variant?.price ?? 0,
    price: variant?.price ?? 0,
    salePrice: variant?.salePrice ?? variant?.price ?? 0,
    productStock: variant?.stock ?? 0,
    wholesalePrice: wholesaleTier?.price,
    wholesaleQty: wholesaleTier?.minQty,
    weight: 0,
  };
}

export async function getProductBySlug(slug: string) {
  const product = await db.product.findFirst({
    where: {
      OR: [
        { slug },
        {
          translations: {
            some: { slug },
          },
        },
      ],
    },
    include: {
      images: {
        orderBy: { isPrimary: "desc" },
      },
      translations: true,
      variants: {
        include: {
          wholesalePricing: {
            orderBy: { minQty: "asc" },
          },
        },
        orderBy: { isDefault: "desc" },
      },
    },
  });

  return product ? mapProduct(product) : null;
}

export async function getSimilarProducts(
  categoryId: string,
  excludeProductId: string
): Promise<NonNullable<ProductDetail>[]> {
  const products = await db.product.findMany({
    where: {
      categoryId,
      id: { not: excludeProductId },
      isActive: true,
    },
    take: 12,
    include: {
      images: {
        orderBy: { isPrimary: "desc" },
      },
      translations: true,
      variants: {
        include: {
          wholesalePricing: {
            orderBy: { minQty: "asc" },
          },
        },
        orderBy: { isDefault: "desc" },
      },
    },
  });

  return products.map(mapProduct);
}
