import Breadcrumb from "@/components/frontend/Breadcrumb";
import CategoryCarousel from "@/components/frontend/CategoryCarousel";
import ProductImageCarousel from "@/components/frontend/ProductImageCarousel";
import ProductShareButton from "@/components/frontend/ProductShareButton";
import DeliverToButton from "@/components/location/DeliverToButton";
import PincodeChecker from "@/components/location/PincodeChecker";
import { formatINR } from "@/lib/currency";
import {
  BadgeCheck,
  Clock,
  CreditCard,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Tag,
  ThumbsUp,
  Truck,
} from "lucide-react";
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

const labels = {
  en: {
    reviews: "reviews",
    off: "off",
    availableOffers: "Available offers",
    specialPrice: "Special price inclusive of current product discount.",
    securePayment: "Secure payment options available at checkout.",
    sellerFulfillment: "Seller-backed fulfillment for eligible orders.",
    deliveryReturns: "Delivery & Returns",
    fastDispatch: "Fast dispatch with pincode-based delivery estimates.",
    easyReturns: "Easy returns on eligible items after delivery.",
    secureCheckout: "Secure checkout and seller-backed fulfillment.",
    sellerInformation: "Seller Information",
    registeredSeller: "Registered marketplace seller",
    verifiedSeller: "Verified seller",
    sellerVerifiedCheckout: "Seller details verified at checkout",
    description: "Description",
    noDescription: "No description available.",
    specifications: "Specifications",
    noSpecifications: "Specifications are not available for this product.",
    relatedProducts: "Related Products",
    catalogUpdated: "Updated from the same catalog",
    customerReviews: "Customer Reviews",
    reviewSummary: "Reviewed by verified buyers after delivery.",
    verifiedPurchase: "Verified purchase",
    comfortFit: "Quality matched expectations and variant details were accurate.",
    fastDelivery: "Fast delivery with secure packaging.",
    valueForMoney: "Good value for repeated marketplace orders.",
  },
  hi: {
    reviews: "समीक्षाएं",
    off: "छूट",
    availableOffers: "उपलब्ध ऑफर",
    specialPrice: "वर्तमान उत्पाद छूट के साथ विशेष कीमत।",
    securePayment: "चेकआउट पर सुरक्षित भुगतान विकल्प उपलब्ध हैं।",
    sellerFulfillment: "योग्य ऑर्डर के लिए विक्रेता समर्थित पूर्ति।",
    deliveryReturns: "डिलीवरी और रिटर्न",
    fastDispatch: "पिनकोड के आधार पर तेज डिस्पैच और डिलीवरी अनुमान।",
    easyReturns: "योग्य आइटम पर डिलीवरी के बाद आसान रिटर्न।",
    secureCheckout: "सुरक्षित चेकआउट और विक्रेता समर्थित पूर्ति।",
    sellerInformation: "विक्रेता जानकारी",
    registeredSeller: "रजिस्टर्ड मार्केटप्लेस विक्रेता",
    verifiedSeller: "सत्यापित विक्रेता",
    sellerVerifiedCheckout: "विक्रेता विवरण चेकआउट पर सत्यापित होगा",
    description: "विवरण",
    noDescription: "विवरण उपलब्ध नहीं है।",
    specifications: "विशेषताएं",
    noSpecifications: "इस उत्पाद की विशेषताएं उपलब्ध नहीं हैं।",
    relatedProducts: "संबंधित उत्पाद",
    catalogUpdated: "उसी कैटलॉग से अपडेट किया गया",
    customerReviews: "ग्राहक समीक्षाएं",
    reviewSummary: "डिलीवरी के बाद सत्यापित खरीदारों द्वारा समीक्षा।",
    verifiedPurchase: "सत्यापित खरीद",
    comfortFit: "क्वालिटी अपेक्षा के अनुसार रही और वेरिएंट विवरण सही थे।",
    fastDelivery: "सुरक्षित पैकेजिंग के साथ तेज डिलीवरी।",
    valueForMoney: "बार-बार मार्केटप्लेस ऑर्डर के लिए अच्छा मूल्य।",
  },
  mr: {
    reviews: "पुनरावलोकने",
    off: "सूट",
    availableOffers: "उपलब्ध ऑफर",
    specialPrice: "सध्याच्या उत्पादन सवलतीसह विशेष किंमत.",
    securePayment: "चेकआउटवर सुरक्षित पेमेंट पर्याय उपलब्ध आहेत.",
    sellerFulfillment: "पात्र ऑर्डरसाठी विक्रेता समर्थित पूर्तता.",
    deliveryReturns: "डिलिव्हरी आणि रिटर्न",
    fastDispatch: "पिनकोडनुसार जलद डिस्पॅच आणि डिलिव्हरी अंदाज.",
    easyReturns: "पात्र वस्तूंवर डिलिव्हरीनंतर सोपे रिटर्न.",
    secureCheckout: "सुरक्षित चेकआउट आणि विक्रेता समर्थित पूर्तता.",
    sellerInformation: "विक्रेता माहिती",
    registeredSeller: "नोंदणीकृत मार्केटप्लेस विक्रेता",
    verifiedSeller: "सत्यापित विक्रेता",
    sellerVerifiedCheckout: "विक्रेता तपशील चेकआउटवर सत्यापित होतील",
    description: "वर्णन",
    noDescription: "वर्णन उपलब्ध नाही.",
    specifications: "तपशील",
    noSpecifications: "या उत्पादनाचे तपशील उपलब्ध नाहीत.",
    relatedProducts: "संबंधित उत्पादने",
    catalogUpdated: "त्याच कॅटलॉगमधून अपडेट केले",
    customerReviews: "ग्राहक पुनरावलोकने",
    reviewSummary: "डिलिव्हरीनंतर सत्यापित खरेदीदारांनी दिलेली समीक्षा.",
    verifiedPurchase: "सत्यापित खरेदी",
    comfortFit: "क्वालिटी अपेक्षेनुसार होती आणि वेरिएंट तपशील अचूक होते.",
    fastDelivery: "सुरक्षित पॅकेजिंगसह जलद डिलिव्हरी.",
    valueForMoney: "वारंवार मार्केटप्लेस ऑर्डरसाठी चांगले मूल्य.",
  },
} as const;

export default function ProductDetailView({
  product,
  similarProducts,
  urlToShare,
  currentLocale = "en",
}: Props) {
  const text =
    labels[currentLocale.toLowerCase() as keyof typeof labels] ?? labels.en;
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
  const discount =
    product.productPrice > 0 && product.salePrice < product.productPrice
      ? Math.round(
          ((product.productPrice - product.salePrice) / product.productPrice) *
            100
        )
      : 0;
  const rating = 4.7;
  const reviewCount = 128;
  const normalizedLocale = currentLocale.toLowerCase();
  const languageQuery = normalizedLocale === "en" ? "" : `?lang=${normalizedLocale}`;
  const categoryHref = product.categorySlug
    ? `/category/${product.categorySlug}${languageQuery}`
    : "#";
  const subCategoryHref = product.subCategorySlug
    ? `/${normalizedLocale}/subcategory/${product.subCategorySlug}`
    : "#";
  const defaultVariant =
    product.variants.find((variant) => variant.isDefault) ??
    product.variants[0];
  const variantAttributes = defaultVariant?.attributes ?? [];
  const specs = [
    ["Product Code", product.productCode],
    ["Unit", product.unit],
    ["Currency", product.currency],
    ...variantAttributes.map((attribute) => [attribute.name, attribute.value]),
  ].filter(([, value]) => Boolean(value)) as [
    string,
    string | number | null | undefined,
  ][];
  const reviewHighlights = [
    {
      title: "Aarav M.",
      body: text.comfortFit,
      icon: Sparkles,
    },
    {
      title: "Priya S.",
      body: text.fastDelivery,
      icon: Truck,
    },
    {
      title: "Neha K.",
      body: text.valueForMoney,
      icon: ThumbsUp,
    },
  ];

  return (
    <div className="space-y-6 pb-10 text-slate-950 dark:text-white">
      <Breadcrumb />

      <div className="border bg-card text-card-foreground shadow-sm grid grid-cols-12 gap-0 overflow-hidden rounded-3xl bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)] ring-1 ring-slate-950/5 dark:bg-slate-950 dark:shadow-[0_24px_70px_rgba(0,0,0,0.34)] dark:ring-white/10 lg:gap-0">
        <div className="col-span-12 border-b border-slate-950/5 p-4 dark:border-white/10 lg:col-span-4 lg:border-b-0 lg:border-r">
          <div className="lg:sticky lg:top-24">
            <ProductImageCarousel
              productImages={product.productImages}
              thumbnail={product.imageUrl || ""}
              title={product.title}
            />
          </div>
        </div>

        <div className="col-span-12 space-y-5 p-4 sm:p-6 lg:col-span-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {product.categoryName ? (
                  <Link
                    href={categoryHref}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
                  >
                    {product.categoryName}
                  </Link>
                ) : null}
                {product.subCategoryName ? (
                  <Link
                    href={subCategoryHref}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
                  >
                    {product.subCategoryName}
                  </Link>
                ) : null}
              </div>

              <h1 className="text-foreground text-xl font-medium leading-snug sm:text-2xl">
                {product.title}
              </h1>
            </div>
            <ProductShareButton
              urlToShare={urlToShare}
              title={product.title}
              image={product.imageUrl || product.productImages[0] || ""}
            />
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-950 px-2.5 py-1 text-xs font-semibold text-white dark:bg-white dark:text-slate-950">
                {rating.toFixed(1)}
                <Star className="h-3 w-3 fill-white text-white" />
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                ({reviewCount} {text.reviews})
              </span>
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <p className="text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">
                {formatINR(product.salePrice)}
              </p>
              {product.productPrice > product.salePrice ? (
                <del className="pb-1 text-base text-slate-400">
                  {formatINR(product.productPrice)}
                </del>
              ) : null}
              {discount > 0 ? (
                <span className="mb-1 inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
                  <Tag className="me-1.5 h-4 w-4" />
                  {discount}% {text.off}
                </span>
              ) : null}
            </div>
          </div>

          <div className="border bg-card text-card-foreground shadow-sm rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-950/5 dark:bg-white/[0.04] dark:ring-white/10">
            <h2 className="mb-3 text-sm font-semibold text-slate-950 dark:text-white">
              {text.availableOffers}
            </h2>
            <div className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              <p className="flex gap-2">
                <Tag className="mt-0.5 h-4 w-4 text-emerald-600" />
                {text.specialPrice}
              </p>
              <p className="flex gap-2">
                <CreditCard className="mt-0.5 h-4 w-4 text-emerald-600" />
                {text.securePayment}
              </p>
              <p className="flex gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-600" />
                {text.sellerFulfillment}
              </p>
            </div>
          </div>

        </div>

        <div className="col-span-12 space-y-4 border-t border-slate-950/5 p-4 dark:border-white/10 lg:col-span-3 lg:border-l lg:border-t-0">
          <ProductPurchaseControls
            product={product}
            currentLocale={currentLocale}
          />

          <section className="border bg-card text-card-foreground shadow-sm rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-950/5 dark:bg-white/[0.04] dark:ring-white/10">
            <h2 className="mb-4 font-semibold text-slate-950 dark:text-white">
              {text.deliveryReturns}
            </h2>

            <div className="space-y-4">
              <DeliverToButton />
              <PincodeChecker />

              <div className="grid gap-3 text-sm text-slate-700 dark:text-slate-200">
                <div className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-950/5 dark:bg-white/[0.04] dark:ring-white/10">
                  <Truck className="mt-0.5 h-5 w-5 text-sky-500" />
                  <span>{text.fastDispatch}</span>
                </div>
                <div className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-950/5 dark:bg-white/[0.04] dark:ring-white/10">
                  <RotateCcw className="mt-0.5 h-5 w-5 text-emerald-500" />
                  <span>{text.easyReturns}</span>
                </div>
                <div className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-950/5 dark:bg-white/[0.04] dark:ring-white/10">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-fuchsia-500" />
                  <span>{text.secureCheckout}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="border bg-card text-card-foreground shadow-sm rounded-3xl bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] ring-1 ring-slate-950/5 dark:bg-slate-950 dark:ring-white/10">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
            {text.sellerInformation}
          </h2>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200">
              <Store className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-950 dark:text-white">
                {product.sellerName}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {product.sellerCode || text.registeredSeller}
              </p>
              {product.sellerLocation ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {product.sellerLocation}
                </p>
              ) : null}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-950/5 dark:bg-white/[0.04] dark:text-slate-200 dark:ring-white/10">
            <BadgeCheck className="h-4 w-4 text-sky-500" />
            {product.sellerVerified
              ? text.verifiedSeller
              : text.sellerVerifiedCheckout}
          </div>
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="border bg-card text-card-foreground shadow-sm rounded-3xl bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] ring-1 ring-slate-950/5 dark:bg-slate-950 dark:ring-white/10">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
            {text.description}
          </h2>
          <div
            className="prose prose-sm max-w-none text-slate-700 dark:prose-invert dark:text-slate-200"
            dangerouslySetInnerHTML={{
              __html: cleanedDescription || text.noDescription,
            }}
          />
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] ring-1 ring-slate-950/5 dark:bg-slate-950 dark:ring-white/10">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
            {text.specifications}
          </h2>
          <div className="overflow-hidden rounded-2xl">
            {specs.length ? (
              specs.map(([label, value]) => (
                <div
                  key={`${label}-${value}`}
                  className="grid grid-cols-[minmax(120px,0.8fr)_1fr] gap-3 border-b border-slate-950/5 px-4 py-3 text-sm last:border-b-0 dark:border-white/10"
                >
                  <span className="text-slate-500 dark:text-slate-400">
                    {label}
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {value}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {text.noSpecifications}
              </p>
            )}
          </div>
        </section>
      </div>

      <section className="border bg-card text-card-foreground shadow-sm overflow-hidden rounded-3xl bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] ring-1 ring-slate-950/5 dark:bg-slate-950 dark:ring-white/10">
        <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="border bg-card text-card-foreground shadow-sm rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-950/5 dark:bg-white/[0.04] dark:ring-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/20 dark:bg-white dark:text-slate-950">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
                  {text.customerReviews}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {text.reviewSummary}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-end gap-3">
              <span className="text-5xl font-semibold tracking-normal text-slate-950 dark:text-white">
                {rating.toFixed(1)}
              </span>
              <div className="pb-1">
                <div className="mb-1 flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`h-4 w-4 ${
                        index < Math.floor(rating) ? "fill-amber-400" : ""
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {reviewCount} {text.reviews}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {reviewHighlights.map((review) => {
              const Icon = review.icon;

              return (
                <article
                  key={review.title}
                  className="border bg-card text-card-foreground shadow-sm rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-950/5 transition hover:-translate-y-0.5 dark:bg-white/[0.04] dark:ring-white/10"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm dark:bg-white/10 dark:text-slate-100">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-200">
                      {text.verifiedPurchase}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-950 dark:text-white">
                    {review.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {review.body}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border bg-card text-card-foreground shadow-sm rounded-3xl bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] ring-1 ring-slate-950/5 dark:bg-slate-950 dark:ring-white/10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
            {text.relatedProducts}
          </h2>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Clock className="h-4 w-4" />
            {text.catalogUpdated}
          </div>
        </div>

        <Suspense fallback={<p>Loading...</p>}>
          <CategoryCarousel products={similarProducts} />
        </Suspense>
      </section>
    </div>
  );
}
