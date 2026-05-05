import AddToCartButton from "@/components/frontend/AddToCartButton";
import Breadcrumb from "@/components/frontend/Breadcrumb";
import CategoryCarousel from "@/components/frontend/CategoryCarousel";
import ProductImageCarousel from "@/components/frontend/ProductImageCarousel";
import ProductShareButton from "@/components/frontend/ProductShareButton";
import { getProductBySlug, getSimilarProducts } from "@/actions/products";
import { Send, Tag } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Suspense } from "react";
import DeliverWrapper from "@/components/location/DeliverWrapper";
import ProductDeliverySection from "@/components/location/ProductDeliverySection";
import DeliverToButton from "@/components/location/DeliverToButton";
import PincodeChecker from "@/components/location/PincodeChecker";

/* ================= TYPES ================= */

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

/* ================= SEO ================= */

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product",
      description: "Product details",
    };
  }

  return {
    title: product.title,
    description: product.metaDescription || "Product details",
    openGraph: {
      images: [product.imageUrl || ""],
    },
  };
}

/* ================= PAGE ================= */

export default async function ProductDetailPage({
  params,
}: PageProps) {
  const { slug } = await params;

  /* ===== PRODUCT ===== */
  const product = await getProductBySlug(slug);

  if (!product) {
    return notFound();
  }

  const products = await getSimilarProducts(product.categoryId, product.id);

  /* ===== SHARE ===== */
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const urlToShare = `${baseUrl}/products/${slug}`;

  /* ===== DISCOUNT ===== */
  const discount =
    product.productPrice > 0
      ? Math.round(
          ((product.productPrice - product.salePrice) /
            product.productPrice) *
            100
        )
      : 0;

  return (
    <div>
      <Breadcrumb />

      <div className="grid grid-cols-12 gap-8">
        {/* LEFT */}
        <ProductImageCarousel
          productImages={product.productImages}
          thumbnail={product.imageUrl || ""}
        />
<DeliverWrapper />
        {/* CENTER */}
        <div className="col-span-12 lg:col-span-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl lg:text-3xl font-semibold">
              {product.title}
            </h2>
            <ProductShareButton urlToShare={urlToShare} />
          </div>

          <div className="border-b pb-4">
            <div
              className="prose prose-sm max-w-none py-2 text-slate-700 dark:prose-invert dark:text-slate-200"
              dangerouslySetInnerHTML={{
                __html: product.description || "No description available.",
              }}
            />

            <div className="flex gap-8 mb-4">
              <p>SKU: {product.sku}</p>

              <p className="bg-lime-200 px-4 py-1 rounded-full">
                Stock: {product.productStock}
              </p>
            </div>
          </div>

          {/* PRICE */}
          <div className="flex justify-between pt-4 pb-4 border-b">
            <div className="flex gap-4 items-center">
              <h4 className="text-2xl font-bold text-orange-500">
                ₹{product.salePrice}
              </h4>

              <del className="text-gray-400">
                ₹{product.productPrice}
              </del>
            </div>

            <p className="flex items-center text-green-600">
              <Tag className="w-5 h-5 me-2" />
              Save {discount}%
            </p>
          </div>

          {/* 🔥 WHOLESALE UI */}
          {product.isWholesale &&
            product.wholesalePrice &&
            product.wholesaleQty && (
              <div className="mt-4 p-4 border rounded-lg bg-orange-50 dark:bg-orange-900/20">
                <h3 className="font-semibold text-orange-600">
                  Wholesale 
                </h3>

                <p>
                  Price: ₹{product.wholesalePrice}
                </p>

                <p>
                  Min Qty: {product.wholesaleQty}
                </p>
              </div>
            )}

          {/* ACTION */}
          <div className="flex justify-between py-6">
            <AddToCartButton product={product} />
          <ProductDeliverySection
  productId={product.id}
  weight={product.weight}
  price={product.salePrice}
/>
          </div>
        </div>

        {/* DELIVERY LEFT */}
      <div className="space-y-4 col-span-12 lg:col-span-3">
  {/* 📍 Location Button */}
  <DeliverToButton />

  {/* 📦 Pincode Check */}
  <PincodeChecker />
</div>

        {/* RIGHT */}
        <div className="col-span-12 lg:col-span-3 bg-white dark:bg-gray-800 border rounded-lg overflow-hidden">
          <h2 className="bg-gray-100 dark:bg-gray-900 py-3 px-6 font-semibold border-b">
            DELIVERY & RETURNS
          </h2>

          <div className="p-4">
            <div className="flex rounded-lg py-2 px-4 bg-orange-500 text-white items-center gap-3">
              <span>Express</span>
              <Send />
            </div>

            <div className="py-3 border-b">
              Eligible for Free Delivery{" "}
              <Link href="#" className="text-blue-500 underline">
                View Details
              </Link>
            </div>

            <ProductDeliverySection />
          </div>
        </div>

        {/* SIMILAR */}
        <div className="col-span-12 bg-white dark:bg-gray-800 mt-8 p-4 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">
            Similar Products
          </h2>

          <Suspense fallback={<p>Loading...</p>}>
            <CategoryCarousel products={products} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
