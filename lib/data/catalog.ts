import { db } from "@/lib/db";
import { cache } from "react";

export const getCategories = cache(async () => {
  return db.category.findMany({
    include: {
      translations: true,
      subCategories: {
        include: {
          translations: true,
        },
      },
    },
  });
});

export const getProducts = cache(async () => {
  return db.product.findMany({
    include: {
      translations: true,
    },
  });
});

export const getMarkets = cache(async () => {
  return db.market.findMany({
    include: {
      translations: true,
      products: {
        include: {
          translations: true,
        },
      },
    },
  });
});