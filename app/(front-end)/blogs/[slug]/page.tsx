import { db } from "@/lib/db";
import { notFound } from "next/navigation";

/* ================================
   METADATA (SEO 🔥)
================================ */

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const blog = await db.blog.findUnique({
    where: { slug: params.slug },
    include: { translations: true },
  });

  if (!blog) return {};

  const t = blog.translations[0];

  return {
    title: t?.metaTitle || t?.title || blog.slug,
    description: t?.metaDescription || t?.description,

    alternates: {
      canonical: `/blogs/${blog.slug}`,
    },
  };
}

/* ================================
   PAGE
================================ */

export default async function BlogDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const blog = await db.blog.findUnique({
    where: { slug: params.slug },
    include: {
      translations: true,
      relatedProducts: true,
    },
  });

  if (!blog) return notFound();

  const t = blog.translations[0];

  return (
    <article className="max-w-3xl mx-auto p-6 space-y-6">

      {/* TITLE */}
      <h1 className="text-3xl font-bold">
        {t?.title}
      </h1>

      {/* IMAGE */}
      {blog.imageUrl && (
        <img
          src={blog.imageUrl}
          alt={t?.title}
          className="w-full h-[400px] object-cover rounded"
        />
      )}

      {/* CONTENT */}
      <div className="prose max-w-none">
        <pre>
          {JSON.stringify(blog.content, null, 2)}
        </pre>
      </div>

      {/* RELATED PRODUCTS */}
      {blog.relatedProducts?.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold">
            Related Products
          </h2>

          <ul className="list-disc pl-5">
            {blog.relatedProducts.map((p) => (
              <li key={p.id}>{p.title}</li>
            ))}
          </ul>
        </div>
      )}

      {/* STRUCTURED DATA (SEO PRO 🔥) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: t?.title,
            description: t?.description,
          }),
        }}
      />
    </article>
  );
}