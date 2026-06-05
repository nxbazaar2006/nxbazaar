export type BlogLocale = "en" | "hi" | "mr";

export type BlogTranslation = {
  id?: string;
  locale: BlogLocale | string;
  title: string;
  description?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
};

export type BlogType = {
  id: string;
  slug: string;
  imageUrl?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  content: unknown;
  userId: string;
  categoryId?: string | null;
  translations: BlogTranslation[];
  relatedProducts?: {
    id: string;
    title: string;
    slug: string;
    productCode?: string | null;
    imageUrl?: string | null;
    hsnCode?: {
      code: string;
    } | null;
    category?: {
      title: string;
      translations?: {
        locale: string;
        title: string;
      }[];
    } | null;
    subCategory?: {
      title: string;
      translations?: {
        locale: string;
        title: string;
      }[];
    } | null;
    images?: {
      url: string;
      isPrimary: boolean;
    }[];
    translations?: {
      locale: string;
      title: string;
      slug?: string | null;
      description?: string | null;
    }[];
    variants?: {
      price: number;
      salePrice?: number | null;
      barcode?: string | null;
      productCode?: string | null;
      image?: string | null;
      isDefault: boolean;
      attributes?: {
        name: string;
        value: string;
      }[];
      wholesalePricing?: {
        minQty: number;
        price: number;
      }[];
    }[];
  }[];
  createdAt: string | Date;
  updatedAt: string | Date;
};
