import Breadcrumb from "@/components/frontend/Breadcrumb";
import CategoryList from "@/components/frontend/CategoryList";
import { db } from "@/lib/db";
import Image from "next/image";
import React from "react";

interface MarketPageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export default async function Page({ params }: MarketPageProps) {
  const { slug } = await params;
  const market = await db.market.findFirst({
    where: {
      translations: {
        some: {
          slug,
        },
      },
    },
    include: {
      translations: true,
      categories: {
        include: {
          translations: true,
          products: {
            where: {
              isActive: true,
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
          },
        },
      },
    },
  });

  if (!market) {
    return <div>Market not found</div>;
  }

  const marketTranslation =
    market.translations.find((translation) => translation.locale === "EN") ??
    market.translations[0];

  const marketCategories = market.categories
    .map((category) => {
      const categoryTranslation =
        category.translations.find((translation) => translation.locale === "EN") ??
        category.translations[0];

      return {
        id: category.id,
        title: categoryTranslation?.title ?? "Category",
        slug: categoryTranslation?.slug ?? category.id,
        products: category.products.map((product) => {
          const productTranslation =
            product.translations.find((translation) => translation.locale === "EN") ??
            product.translations[0];
          const variant = product.variants[0];

          return {
            id: product.id,
            title: productTranslation?.title ?? product.title,
            slug: productTranslation?.slug ?? product.slug,
            imageUrl:
              variant?.image ??
              product.imageUrl ??
              product.images[0]?.url ??
              "/placeholder.png",
            salePrice: variant?.salePrice ?? variant?.price ?? 0,
          };
        }),
      };
    })
    .filter((category) => category.products.length > 3);

  return (
    <div className="space-y-6">
      <Breadcrumb />
      <div className="glass-card flex items-center gap-6 overflow-hidden p-4 text-slate-800 dark:text-slate-200">
        <div className="">
          <Image
            src={market.logoUrl || "/placeholder.png"}
            width={50}
            height={50}
            alt={marketTranslation?.title ?? market.title}
            className="w-16 h-16 rounded-full object-cover"
          />
        </div>
        <div className="">
          <h2 className="py-4 text-base lg:text-4xl">
            {marketTranslation?.title ?? market.title}
          </h2>
          {marketTranslation?.description || market.description ? (
            <p className="text-sm line-clamp-2 mb-4">
              {marketTranslation?.description ?? market.description}
            </p>
          ) : null}
        </div>
      </div>
      <div className="grid grid-cols-12 gap-6 py-8 w-full">
        <div className="col-span-full sm:col-span-12 rounded-md">
          {marketCategories.map((category, i) => {
            return (
              <div className="space-y-8" key={i}>
                <CategoryList isMarketPage={false} category={category} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
