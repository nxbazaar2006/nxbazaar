import Link from "next/link";
import { BlogType } from "@/types/blog.types";
import { getSafeTranslation } from "@/lib/getTranslation";

type Props = {
  blog: BlogType;
  locale?: string;
};

export default function BlogCard({ blog, locale = "en" }: Props) {
  const translation = getSafeTranslation(blog.translations ?? [], locale);

  const title =
    translation?.title ?? blog.translations?.[0]?.title ?? blog.slug;

  const description =
    translation?.description ?? blog.translations?.[0]?.description ?? "";

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">

      {/* IMAGE */}
      {blog.imageUrl && (
        <img
          src={blog.imageUrl}
          alt={title}
          className="w-full h-48 object-cover"
        />
      )}

      <div className="p-4 space-y-2">
        {/* TITLE */}
        <h2 className="text-lg font-semibold">
          {title}
        </h2>

        {/* DESC */}
        <p className="text-sm text-gray-600 line-clamp-2">
          {description}
        </p>

        {/* READ MORE */}
        <Link
          href={`/${locale}/blogs/${blog.slug}`}
          className="text-blue-600 text-sm"
        >
          Read More →
        </Link>
      </div>
    </div>
  );
}
