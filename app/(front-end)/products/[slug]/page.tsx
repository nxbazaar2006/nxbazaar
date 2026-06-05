import { getProductBySlug, getSimilarProducts } from "@/actions/products";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import ProductDetailView from "@/components/frontend/ProductDetailView";

/* ================= TYPES ================= */

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    lang?: string;
  }>;
};

function normalizeLocale(locale?: string) {
  return ["hi", "mr"].includes(locale ?? "") ? locale!.toUpperCase() : "EN";
}

/* ================= SEO ================= */

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product",
      description: "Product details",
    };
  }

  return {
    title: product.title,
    description: product.metaDescription || "Product details",
    openGraph: {
      images: [product.imageUrl || ""],
    },
  };
}

/* ================= PAGE ================= */

export default async function ProductDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { lang } = (await searchParams) ?? {};
  const locale = normalizeLocale(lang);

  /* ===== PRODUCT ===== */
  const product = await getProductBySlug(slug, locale);

  if (!product) {
    return notFound();
  }

  const products = await getSimilarProducts(product.categoryId, product.id, locale);

  /* ===== SHARE ===== */
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const urlToShare = `${baseUrl}/products/${slug}${lang ? `?lang=${lang}` : ""}`;

  return (
    <ProductDetailView
      product={product}
      similarProducts={products}
      urlToShare={urlToShare}
      currentLocale={locale.toLowerCase()}
    />
  );
}
