import { getCategories } from "@/actions/category";
import Image from "next/image";
import Link from "next/link";

export default async function SidebarCategories() {
  const categoriesData = await getCategories("");

  // Only categories with products
  const categories = Array.isArray(categoriesData)
    ? categoriesData.filter((category) => category.products?.length > 0)
    : [];

  return (
    <div className="apple-glass hidden overflow-hidden sm:col-span-3 sm:block">
      
      <h2 className="border-b border-white/30 px-6 py-4 font-semibold text-foreground dark:border-white/10">
        Shop By Category ({categories.length})
      </h2>

      <div className="flex h-[300px] flex-col gap-2 overflow-y-auto px-4 py-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className="apple-glass-soft flex items-center gap-3 p-2 text-foreground/90 transition hover:-translate-y-0.5 hover:bg-white/75 dark:hover:bg-white/10"
          >
            <Image
              width={40}
              height={40}
              className="h-10 w-10 rounded-full border border-white/50 object-cover shadow-sm dark:border-white/10"
              src={category.imageUrl || "/placeholder.png"}
              alt={category.title}
            />

            <span className="text-sm font-medium">{category.title}</span>
          </Link>
        ))}
      </div>

    </div>
  );
}
