export type VlogTranslation = { id?: string; locale: string; title: string; slug: string };
export type VlogType = {
  id: string;
  title: string;
  productId?: string | null;
  userId?: string | null;
  blogId?: string | null;
  translations: VlogTranslation[];
  createdAt: string | Date;
  updatedAt: string | Date;
};
