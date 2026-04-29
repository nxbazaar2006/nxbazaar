import type { Prisma } from "@prisma/client";

export type Product = Prisma.ProductGetPayload<{
  include: {
    category: true;
    subCategory: true;
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
