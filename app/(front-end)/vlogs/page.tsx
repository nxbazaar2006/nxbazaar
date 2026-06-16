import { db } from "@/lib/db";
import { getSafeTranslation } from "@/lib/getTranslation";
import Link from "next/link";

export default async function VlogsPage() {
  const vlogs = await db.vlog.findMany({
    include: {
      translations: true,
      blog: true,
      product: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="space-y-6 py-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Vlog</h1>
        <p className="text-sm text-muted-foreground">{vlogs.length} videos</p>
      </div>

      {vlogs.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {vlogs.map((vlog) => {
            const translation =
              getSafeTranslation(vlog.translations, "en") ?? vlog.translations[0];
            const title = translation?.title ?? vlog.title;

            return (
              <article
                key={vlog.id}
                className="border bg-card text-card-foreground shadow-sm space-y-3 transition hover:-translate-y-0.5"
              >
                <h2 className="text-lg font-semibold">{title}</h2>

                <div className="space-y-1 text-sm text-muted-foreground">
                  {vlog.product ? <p>Product: {vlog.product.title}</p> : null}
                  {vlog.blog ? <p>Blog: {vlog.blog.slug}</p> : null}
                </div>

                {vlog.blog ? (
                  <Link
                    href={`/blogs/${vlog.blog.slug}`}
                    className="inline-flex text-sm font-medium text-primary"
                  >
                    Related Blog →
                  </Link>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
          No vlogs found.
        </div>
      )}
    </main>
  );
}
