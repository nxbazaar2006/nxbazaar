import FilterComponent from "@/components/frontend/Filter/FilterComponent";
import { db } from "@/lib/db";
import React from "react";

function getEnglishTranslation(translations) {
  return translations.find((translation) => translation.locale === "EN") ?? translations[0];
}

function mapProduct(product) {
  const translation = getEnglishTranslation(product.translations);
  const variant = product.variants[0];

  return {
    id: product.id,
    userId: product.userId,
    title: translation?.title ?? product.title,
    slug: translation?.slug ?? product.slug,
    imageUrl:
      variant?.image ??
      product.imageUrl ??
      product.images[0]?.url ??
      "/placeholder.png",
    salePrice: variant?.salePrice ?? variant?.price ?? 0,
  };
}

export default async function Search({ searchParams }) {
  //SORTING, SEARCHING AND FILTERING
  const {
    sort = "asc",
    min = 0,
    max = "",
    page = 1,
    search = "",
  } = searchParams;
  const dbProducts = await db.product.findMany({
    where: {
      isActive: true,
      ...(search
        ? {
            OR: [
              {
                title: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                translations: {
                  some: {
                    title: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                },
              },
            ],
          }
        : {}),
    },
    include: {
      translations: true,
      variants: {
        where: {
          isActive: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      images: {
        orderBy: {
          isPrimary: "desc",
        },
      },
    },
  });
  const pageSize = 3;
  const currentPage = Math.max(Number(page), 1);
  const minPrice = Number(min || 0);
  const maxPrice = max ? Number(max) : null;
  const products = dbProducts
    .map(mapProduct)
    .filter((product) => product.salePrice >= minPrice)
    .filter((product) => (maxPrice === null ? true : product.salePrice <= maxPrice))
    .sort((a, b) =>
      sort === "desc" ? b.salePrice - a.salePrice : a.salePrice - b.salePrice
    )
    .slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const category = {
    title: search,
    slug: "",
    isSearch: true,
    products,
  };
  return (
    <div>
      <FilterComponent category={category} products={products} />
    </div>
  );
}
