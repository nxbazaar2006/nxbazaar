import FilterComponent from "@/components/frontend/Filter/FilterComponent";
import { getCategories } from "@/actions/category";
import { db } from "@/lib/db";

// ✅ Params Types
type PageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    lang?: string;
    sort?: string;
    min?: string;
    max?: string;
    page?: string;
    search?: string;
  }>;
};

function getTranslation<
  T extends {
    locale: string;
    title: string;
    slug: string | null;
    description?: string | null;
  }
>(translations: T[], locale = "EN") {
  return (
    translations.find((translation) => translation.locale === locale) ??
    translations.find((translation) => translation.locale === "EN") ??
    translations[0] ??
    null
  );
}

function mapProduct(product: {
  id: string;
  userId: string;
  title: string;
  slug: string;
  imageUrl: string | null;
  translations: { locale: string; title: string; slug: string | null }[];
  variants: { price: number; salePrice: number | null; image: string | null; isDefault: boolean }[];
  images: { url: string; isPrimary: boolean }[];
}, locale = "EN") {
  const translation = getTranslation(product.translations, locale);
  const variant =
    product.variants.find((item) => item.isDefault) ?? product.variants[0];

  return {
    id: product.id,
    userId: product.userId,
    title: translation?.title ?? product.title,
    slug: translation?.slug ?? product.slug,
    imageUrl:
      variant?.image ??
      product.imageUrl ??
      product.images.find((image) => image.isPrimary)?.url ??
      product.images[0]?.url ??
      "/placeholder.png",
    salePrice: variant?.salePrice ?? variant?.price ?? 0,
  };
}

function normalizeLocale(locale?: string) {
  return ["hi", "mr"].includes(locale ?? "") ? locale!.toUpperCase() : "EN";
}

export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = (await searchParams) ?? {};
  const locale = normalizeLocale(query.lang);

  // ✅ Default values with type safety
  const sort = query.sort ?? "asc";
  const min = Number(query.min ?? 0);
  const max = query.max ? Number(query.max) : undefined;
  const page = Number(query.page ?? 1);

  // ✅ Fetch category
  const categoryResult = await getCategories(`/filter/${slug}`, locale);
  const category = Array.isArray(categoryResult)
    ? categoryResult[0]
    : categoryResult;

  if (!category) {
    return <div>Category not found</div>;
  }

  const productsData = await db.product.findMany({
    where: {
      categoryId: category.id,
      isActive: true,
      ...(query.search
        ? {
            OR: [
              {
                title: {
                  contains: query.search,
                  mode: "insensitive",
                },
              },
              {
                translations: {
                  some: {
                    title: {
                      contains: query.search,
                      mode: "insensitive",
                    },
                  },
                },
              },
            ],
          }
        : {}),
    },
    include: {
      translations: true,
      variants: {
        where: {
          isActive: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      images: {
        orderBy: {
          isPrimary: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const currentPage = Math.max(page, 1);
  const pageSize = 3;
  const products = productsData
    .map((product) => mapProduct(product, locale))
    .filter((product) => product.salePrice >= min)
    .filter((product) => (max === undefined ? true : product.salePrice <= max))
    .sort((a, b) =>
      sort === "desc" ? b.salePrice - a.salePrice : a.salePrice - b.salePrice
    )
    .slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div>
      <FilterComponent category={category} products={products} />
    </div>
  );
}
