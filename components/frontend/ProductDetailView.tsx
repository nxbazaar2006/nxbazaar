import Breadcrumb from "@/components/frontend/Breadcrumb";
import CategoryCarousel from "@/components/frontend/CategoryCarousel";
import LanguageLinks from "@/components/frontend/LanguageLinks";
import ProductImageCarousel from "@/components/frontend/ProductImageCarousel";
import ProductShareButton from "@/components/frontend/ProductShareButton";
import DeliverToButton from "@/components/location/DeliverToButton";
import PincodeChecker from "@/components/location/PincodeChecker";
import { Send } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import type { getProductBySlug } from "@/actions/products";
import ProductPurchaseControls from "@/components/frontend/ProductPurchaseControls";

type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;

type Props = {
  product: ProductDetail;
  similarProducts: ProductDetail[];
  urlToShare: string;
  currentLocale?: string;
};

export default function ProductDetailView({
  product,
  similarProducts,
  urlToShare,
  currentLocale = "en",
}: Props) {
  const localizedDescription =
    product.translations.find(
      (translation) => translation.locale.toLowerCase() === currentLocale.toLowerCase()
    )?.description ??
    product.translations.find(
      (translation) => translation.locale.toUpperCase() === "EN"
    )?.description ??
    product.description;
  const cleanedDescription = (localizedDescription || "").replace(
    /<p>\s*cvbcvbcvb\s*<\/p>/gi,
    ""
  ).replace(/<\/?p[^>]*>/gi, "");
  return (
    <div className="space-y-6">
      <Breadcrumb />

      <div className="grid grid-cols-12 gap-8">
        <ProductImageCarousel
          productImages={product.productImages}
          thumbnail={product.imageUrl || ""}
        />

        <div className="col-span-12 space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold lg:text-3xl">
                {product.title}
              </h2>
              <LanguageLinks
                translations={product.translations}
                route="products"
                fallbackSlug={product.slug}
                currentLocale={currentLocale}
              />
            </div>
            <ProductShareButton
              urlToShare={urlToShare}
              title={product.title}
              image={product.imageUrl || product.productImages[0] || ""}
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
            <h3 className="mb-2 text-lg font-semibold text-slate-950 dark:text-white">
              Description
            </h3>
            <div
              className="prose prose-sm max-w-none py-2 text-slate-700 dark:prose-invert dark:text-slate-200"
              dangerouslySetInnerHTML={{
                __html: cleanedDescription || "No description available.",
              }}
            />

            <div className="mb-1 flex flex-wrap gap-4">
              <p className="rounded-full border border-slate-200 bg-white px-4 py-1 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                SKU: {product.sku}
              </p>
              <p className="rounded-full bg-emerald-200 px-4 py-1 text-sm text-slate-900 shadow-sm dark:bg-emerald-400/15 dark:text-emerald-200">
                Stock: {product.productStock}
              </p>
            </div>
          </div>

          <ProductPurchaseControls product={product} />
        </div>

        <div className="col-span-12 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-3">
          <h2 className="border-b border-slate-200 px-6 py-4 font-semibold dark:border-slate-800">
            DELIVERY & RETURNS
          </h2>

          <div className="space-y-4 p-4">
            <div className="inline-flex h-10 min-w-40 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-4 text-sm font-semibold text-white shadow-md shadow-fuchsia-500/20">
              <span>Express</span>
              <Send className="h-4 w-4" />
            </div>

            <DeliverToButton />
            <PincodeChecker />

            <div className="border-b border-slate-200 py-3 dark:border-slate-800">
              Eligible for Free Delivery{" "}
              <Link href="#" className="text-blue-500 underline">
                View Details
              </Link>
            </div>
          </div>
        </div>

        <div className="col-span-12 mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-xl font-semibold">Similar Products</h2>

          <Suspense fallback={<p>Loading...</p>}>
            <CategoryCarousel products={similarProducts} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
