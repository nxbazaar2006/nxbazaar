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
  }[];
  createdAt: string | Date;
  updatedAt: string | Date;
};
