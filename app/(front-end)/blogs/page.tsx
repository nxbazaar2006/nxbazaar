import BlogCard from "@/components/frontend/BlogCard";
import { db } from "@/lib/db";

export default async function BlogsPage() {
  const blogs = await db.blog.findMany({
    where: {
      isActive: true,
    },
    include: {
      translations: true,
      relatedProducts: {
        include: {
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
          images: {
            orderBy: { isPrimary: "desc" },
          },
          translations: true,
          variants: {
            include: {
              attributes: true,
              wholesalePricing: {
                orderBy: { minQty: "asc" },
              },
            },
            orderBy: { isDefault: "desc" },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="space-y-6 py-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Blogs</h1>
        <p className="text-sm text-muted-foreground">{blogs.length} posts</p>
      </div>

      {blogs.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} locale="en" />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
          No blog posts found.
        </div>
      )}
    </main>
  );
}
