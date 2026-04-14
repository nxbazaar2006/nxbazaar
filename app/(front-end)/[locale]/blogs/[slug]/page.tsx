import { db } from "@/lib/db";
import { getSafeTranslation } from "@/lib/getTranslation";
import { notFound } from "next/navigation";

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
      relatedProducts: {
        include: {
          translations: true,
        },
      },
    },
  });

  if (!blog) return notFound();

  const translation =
    getSafeTranslation(blog.translations, locale) ??
    blog.translations[0];

  return (
    <article className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">
        {translation?.title ?? blog.slug}
      </h1>

      {blog.imageUrl && (
        <img
          src={blog.imageUrl}
          alt={translation?.title ?? blog.slug}
          className="w-full h-[400px] object-cover rounded"
        />
      )}

      <div className="prose max-w-none">
        <pre>{JSON.stringify(blog.content, null, 2)}</pre>
      </div>

      {blog.relatedProducts?.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold">Related Products</h2>

          <ul className="list-disc pl-5">
            {blog.relatedProducts.map((product) => {
              const productTranslation =
                getSafeTranslation(product.translations, locale) ??
                product.translations[0];

              return (
                <li key={product.id}>
                  {productTranslation?.title ?? product.title}
                </li>
              );
            })}
          </ul>
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
