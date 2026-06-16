import { getProductBySlug, getSimilarProducts } from "@/actions/products";
import ProductDetailView from "@/components/frontend/ProductDetailView";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug, locale);

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

export default async function ProductLocalePage({ params }: PageProps) {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug, locale);

  if (!product) {
    return notFound();
  }

  const products = await getSimilarProducts(
    product.categoryId,
    product.id,
    locale
  );
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const urlToShare = `${baseUrl}/${locale}/products/${slug}`;

  return (
    <ProductDetailView
      product={product}
      similarProducts={products}
      urlToShare={urlToShare}
      currentLocale={locale}
    />
  );
}
