import { db } from "@/lib/db";
import { getSafeTranslation } from "@/lib/getTranslation";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatINR } from "@/lib/currency";
import { Share2 } from "lucide-react";

const relatedProductInclude = {
  category: {
    include: {
      translations: true,
    },
  },
  subCategory: {
    include: {
      translations: true,
    },
  },
  hsnCode: true,
  translations: true,
  images: {
    orderBy: { isPrimary: "desc" as const },
  },
  variants: {
    include: {
      attributes: true,
      wholesalePricing: {
        orderBy: { minQty: "asc" as const },
      },
    },
    orderBy: { isDefault: "desc" as const },
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  const blog = await db.blog.findUnique({
    where: { slug },
    include: { translations: true },
  });

  if (!blog) return {};

  const translation =
    getSafeTranslation(blog.translations, locale) ??
    blog.translations[0];

  return {
    title: translation?.metaTitle || translation?.title || blog.slug,
    description:
      translation?.metaDescription || translation?.description,
    alternates: {
      canonical: `/${locale}/blogs/${blog.slug}`,
    },
  };
}

export default async function LocalizedBlogDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  const blog = await db.blog.findUnique({
    where: { slug },
    include: {
      translations: true,
      category: true,
      relatedProducts: {
        include: relatedProductInclude,
      },
    },
  });

  if (!blog) return notFound();

  const translation =
    getSafeTranslation(blog.translations, locale) ??
    blog.translations[0];
  const explicitProductIds = blog.relatedProducts.map((product) => product.id);
  const explicitCategoryIds = Array.from(
    new Set(blog.relatedProducts.map((product) => product.categoryId))
  );
  const matchedCategories =
    explicitCategoryIds.length > 0 || !blog.category
      ? []
      : await db.category.findMany({
          where: {
            translations: {
              some: {
                OR: [
                  { slug: blog.category.slug },
                  { title: blog.category.title },
                ],
              },
            },
          },
          select: { id: true },
        });
  const categoryIds =
    explicitCategoryIds.length > 0
      ? explicitCategoryIds
      : matchedCategories.map((category) => category.id);
  const categoryProducts =
    categoryIds.length > 0
      ? await db.product.findMany({
          where: {
            categoryId: { in: categoryIds },
            id: { notIn: explicitProductIds },
            isActive: true,
          },
          include: relatedProductInclude,
          take: 12,
        })
      : [];
  const relatedProducts = [
    ...blog.relatedProducts,
    ...categoryProducts,
  ].slice(0, 12);

  return (
    <article className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">
        {translation?.title ?? blog.slug}
      </h1>

      {blog.imageUrl && (
        <img
          src={blog.imageUrl}
          alt={translation?.title ?? blog.slug}
          className="w-full h-[400px] object-cover rounded-2xl"
        />
      )}

      {relatedProducts.length > 0 && (
        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            {relatedProducts.map((product) => {
              const productTranslation =
                getSafeTranslation(product.translations, locale) ??
                product.translations[0];
              const productTitle =
                productTranslation?.title ?? product.title;
              const productSlug =
                productTranslation?.slug ?? product.slug;
              const variant =
                product.variants.find((entry) => entry.isDefault) ??
                product.variants[0];
              const wholesale = variant?.wholesalePricing[0];
              const size = variant?.attributes.find(
                (attribute) => attribute.name.toLowerCase() === "size"
              )?.value;
              const categoryTranslation =
                getSafeTranslation(product.category.translations, locale) ??
                product.category.translations[0];
              const subCategoryTranslation = product.subCategory
                ? getSafeTranslation(product.subCategory.translations, locale) ??
                  product.subCategory.translations[0]
                : null;
              const productDescription =
                productTranslation?.description
                  ?.replace(/<p>\s*cvbcvbcvb\s*<\/p>/gi, "")
                  .replace(/<\/?p[^>]*>/gi, "")
                  .trim() ?? "";
              const imageUrl =
                variant?.image ??
                product.images.find((image) => image.isPrimary)?.url ??
                product.images[0]?.url ??
                product.imageUrl ??
                "/placeholder.png";
              const productHref = `/${locale}/products/${productSlug}`;
              const shareHref = `https://wa.me/?text=${encodeURIComponent(
                productTitle
              )}%20${encodeURIComponent(productHref)}`;

              return (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition hover:-translate-y-0.5"
                >
                  <Link href={`/${locale}/products/${productSlug}`} className="block">
                    <Image
                      src={imageUrl}
                      alt={productTitle}
                      width={800}
                      height={500}
                      className="h-44 w-full object-cover"
                    />
                  </Link>

                  <div className="space-y-2 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={productHref}
                        className="block text-base font-semibold text-foreground"
                      >
                        {productTitle}
                      </Link>

                      <Link
                        href={shareHref}
                        target="_blank"
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 text-white shadow-md shadow-fuchsia-500/20"
                        aria-label="Share product"
                      >
                        <Share2 className="h-4 w-4" />
                      </Link>
                    </div>

                    {productDescription && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {productDescription}
                      </p>
                    )}

                    <p className="text-sm text-muted-foreground">
                      {variant
                        ? `Starting at ${formatINR(variant.salePrice ?? variant.price)}`
                        : "Price unavailable"}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <p>HSN: {product.hsnCode?.code ?? "-"}</p>
                      <p>Size: {size ?? "-"}</p>
                      <p>Product Code: {product.productCode ?? variant?.productCode ?? "-"}</p>
                      <p>Barcode: {variant?.barcode ?? "-"}</p>
                      <p>Price: {variant ? formatINR(variant.price) : "-"}</p>
                      <p>Sale: {variant?.salePrice ? formatINR(variant.salePrice) : "-"}</p>
                      <p>Wholesale: {wholesale ? formatINR(wholesale.price) : "-"}</p>
                      <p>Qty: {wholesale?.minQty ?? "-"}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: translation?.title,
            description: translation?.description,
          }),
        }}
      />
    </article>
  );
}
