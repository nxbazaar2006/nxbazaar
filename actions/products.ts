"use server";

import { db } from "@/lib/db";

type ProductDetail = Awaited<ReturnType<typeof getProductBySlug>>;

function getTranslation<
  T extends {
    locale: string;
    title: string;
    slug?: string | null;
    description?: string | null;
  }
>(translations: T[], locale = "EN") {
  const normalizedLocale = locale.toUpperCase();

  return (
    translations.find((translation) => translation.locale.toUpperCase() === normalizedLocale) ??
    translations.find((translation) => translation.locale.toUpperCase() === "EN") ??
    translations[0] ??
    null
  );
}

function mapProduct(product: {
  id: string;
  title: string;
  slug: string;
  productCode?: string | null;
  userId: string;
  categoryId: string;
  imageUrl?: string | null;
  isWholesale: boolean;
  images: { url: string; isPrimary: boolean }[];
  translations: {
    locale: string;
    title: string;
    slug: string | null;
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
}, locale = "EN") {
  const translation = getTranslation(product.translations, locale);
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
    slug: translation?.slug ?? product.slug,
    description: translation?.description ?? "",
    metaDescription: translation?.metaDescription ?? translation?.description ?? "",
    imageUrl: primaryImage,
    productImages: product.images.map((image) => image.url),
    sku: variant?.sku ?? "",
    productCode: product.productCode ?? variant?.productCode ?? "",
    productPrice: variant?.price ?? 0,
    price: variant?.price ?? 0,
    salePrice: variant?.salePrice ?? variant?.price ?? 0,
    productStock: variant?.stock ?? 0,
    wholesalePrice: wholesaleTier?.price,
    wholesaleQty: wholesaleTier?.minQty,
    weight: 0,
  };
}

export async function getProductBySlug(slug: string, locale = "EN") {
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

  return product ? mapProduct(product, locale) : null;
}

export async function getSimilarProducts(
  categoryId: string,
  excludeProductId: string,
  locale = "EN"
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

  if (products.length > 0) {
    return products.map((product) => mapProduct(product, locale));
  }

  const fallbackProducts = await db.product.findMany({
    where: {
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

  return fallbackProducts.map((product) => mapProduct(product, locale));
}
