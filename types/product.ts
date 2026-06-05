import type { Prisma } from "@prisma/client";

export type Product = Prisma.ProductGetPayload<{
  include: {
    category: {
      include: {
        translations: true;
      };
    };
    subCategory: {
      include: {
        translations: true;
      };
    };
    hsnCode: true;
    images: true;
    variants: {
      include: {
        attributes: true;
        wholesalePricing: true;
      };
    };
    translations: true;
  };
}>;

export type ProductWithRelations = Product;
