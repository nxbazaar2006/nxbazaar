"use client";

import { formatINR } from "@/lib/currency";
import { addToCart } from "@/redux/slices/cartSlice";
import type { AppDispatch } from "@/redux/store";
import {
  BadgeIndianRupee,
  Barcode,
  Heart,
  Minus,
  PackageCheck,
  Plus,
  ScanLine,
  ShoppingBag,
  Store,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

type ProductVariant = {
  id: string;
  title?: string | null;
  sku?: string | null;
  productCode?: string | null;
  barcode?: string | null;
  barcodeUrl?: string | null;
  price: number;
  salePrice?: number | null;
  image?: string | null;
  isDefault?: boolean;
  stock?: number | null;
  attributes?: { name: string; value: string }[];
};

type Product = {
  id: string;
  title: string;
  salePrice: number;
  productPrice: number;
  imageUrl?: string | null;
  userId?: string;
  isWholesale?: boolean;
  wholesalePrice?: number | null;
  wholesaleQty?: number | null;
  images?: { url: string; isPrimary?: boolean }[];
  variants?: ProductVariant[];
};

type Props = {
  product: Product;
  currentLocale?: string;
};

const labels = {
  en: {
    retail: "Retail",
    wholesale: "Wholesale",
    retailPrice: "Retail price",
    wholesalePrice: "Wholesale price",
    minimumQuantity: "Minimum quantity",
    inStock: "in stock",
    stockCheckout: "Stock updates at checkout",
    addToCart: "Add to Cart",
    buyNow: "Buy Now",
    wholesaleAdded: "Wholesale item added successfully",
    retailAdded: "Retail item added successfully",
    wishlistAdded: "Added to wishlist",
    decreaseQuantity: "Decrease quantity",
    increaseQuantity: "Increase quantity",
    variantDetails: "Variant details",
    sku: "SKU",
    productCode: "Product Code",
    barcode: "Barcode",
  },
  hi: {
    retail: "रिटेल",
    wholesale: "थोक",
    retailPrice: "रिटेल कीमत",
    wholesalePrice: "थोक कीमत",
    minimumQuantity: "न्यूनतम मात्रा",
    inStock: "स्टॉक में",
    stockCheckout: "स्टॉक चेकआउट पर अपडेट होगा",
    addToCart: "कार्ट में जोड़ें",
    buyNow: "अभी खरीदें",
    wholesaleAdded: "थोक आइटम कार्ट में जोड़ा गया",
    retailAdded: "रिटेल आइटम कार्ट में जोड़ा गया",
    wishlistAdded: "विशलिस्ट में जोड़ा गया",
    decreaseQuantity: "मात्रा घटाएं",
    increaseQuantity: "मात्रा बढ़ाएं",
    variantDetails: "वेरिएंट विवरण",
    sku: "SKU",
    productCode: "प्रोडक्ट कोड",
    barcode: "बारकोड",
  },
  mr: {
    retail: "रिटेल",
    wholesale: "घाऊक",
    retailPrice: "रिटेल किंमत",
    wholesalePrice: "घाऊक किंमत",
    minimumQuantity: "किमान प्रमाण",
    inStock: "स्टॉकमध्ये",
    stockCheckout: "स्टॉक चेकआउटवर अपडेट होईल",
    addToCart: "कार्टमध्ये जोडा",
    buyNow: "आता खरेदी करा",
    wholesaleAdded: "घाऊक वस्तू कार्टमध्ये जोडली",
    retailAdded: "रिटेल वस्तू कार्टमध्ये जोडली",
    wishlistAdded: "विशलिस्टमध्ये जोडले",
    decreaseQuantity: "प्रमाण कमी करा",
    increaseQuantity: "प्रमाण वाढवा",
    variantDetails: "वेरिएंट तपशील",
    sku: "SKU",
    productCode: "प्रोडक्ट कोड",
    barcode: "बारकोड",
  },
} as const;

export default function ProductPurchaseControls({
  product,
  currentLocale = "en",
}: Props) {
  const text =
    labels[currentLocale.toLowerCase() as keyof typeof labels] ?? labels.en;
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [mode, setMode] = useState<"retail" | "wholesale">("retail");
  const [quantity, setQuantity] = useState(1);
  const [variantId, setVariantId] = useState<string | undefined>(() => {
    const variant =
      product.variants?.find((item) => item.isDefault) ?? product.variants?.[0];
    return variant?.id;
  });

  const selectedVariant = useMemo(
    () =>
      product.variants?.find((variant) => variant.id === variantId) ??
      product.variants?.find((variant) => variant.isDefault) ??
      product.variants?.[0],
    [product.variants, variantId]
  );

  const retailPrice = Number(
    selectedVariant?.salePrice ?? selectedVariant?.price ?? product.salePrice ?? 0
  );
  const wholesalePrice = Number(
    product.wholesalePrice ?? retailPrice
  );
  const wholesaleQty = Number(product.wholesaleQty ?? 1);
  const hasWholesale = Boolean(product.isWholesale);
  const activePrice = mode === "wholesale" ? wholesalePrice : retailPrice;
  const minQty = mode === "wholesale" ? Math.max(1, wholesaleQty) : 1;
  const activeQty = Math.max(minQty, quantity);
  const variantGroups = useMemo(() => {
    const groups = new Map<string, Set<string>>();

    product.variants?.forEach((variant) => {
      variant.attributes?.forEach((attribute) => {
        const key = attribute.name.toLowerCase();
        if (key === "color" || key === "size") {
          if (!groups.has(key)) groups.set(key, new Set());
          groups.get(key)?.add(attribute.value);
        }
      });
    });

    return Array.from(groups.entries()).map(([name, values]) => ({
      name,
      values: Array.from(values),
    }));
  }, [product.variants]);
  const selectedAttributes = selectedVariant?.attributes ?? [];
  const barcodeText = selectedVariant?.barcode ?? selectedVariant?.sku ?? "";
  const barcodeImageUrl =
    selectedVariant?.barcodeUrl ??
    (barcodeText ? `/api/barcode?text=${encodeURIComponent(barcodeText)}` : "");
  const identityRows = [
    {
      label: text.sku,
      value: selectedVariant?.sku,
      icon: PackageCheck,
    },
    {
      label: text.productCode,
      value: selectedVariant?.productCode,
      icon: ScanLine,
    },
    {
      label: text.barcode,
      value: selectedVariant?.barcode,
      icon: Barcode,
    },
  ].filter((item) => Boolean(item.value));

  const updateQuantity = (nextQty: number) => {
    setQuantity(Math.max(minQty, nextQty));
  };

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        id: product.id,
        productVariantId: selectedVariant?.id,
        title: product.title,
        salePrice: activePrice,
        imageUrl:
          selectedVariant?.image ??
          product.imageUrl ??
          product.images?.find((image) => image.isPrimary)?.url ??
          product.images?.[0]?.url ??
          "",
        vendorId: product.userId,
        qty: activeQty,
      })
    );

    toast.success(
      mode === "wholesale"
        ? text.wholesaleAdded
        : text.retailAdded
    );
  };
  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  return (
    <div className="space-y-4 lg:sticky lg:top-24">
      <div className="raised-panel flex items-center gap-2 rounded-2xl p-1">
        <button
          type="button"
          onClick={() => setMode("retail")}
          className={`inline-flex h-8 flex-1 items-center justify-center gap-2 rounded-2xl px-3 text-xs font-semibold transition ${
            mode === "retail"
              ? "bg-white/70 text-foreground shadow-sm dark:bg-white/20"
              : "text-muted-foreground hover:bg-white/60 hover:text-foreground dark:hover:bg-white/10"
          }`}
        >
          <BadgeIndianRupee className="h-4 w-4" />
          {text.retail}
        </button>

        <button
          type="button"
          onClick={() => setMode("wholesale")}
          disabled={!hasWholesale}
          className={`inline-flex h-8 flex-1 items-center justify-center gap-2 rounded-2xl px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
            mode === "wholesale"
              ? "bg-white/70 text-foreground shadow-sm dark:bg-white/20"
              : "text-muted-foreground hover:bg-white/60 hover:text-foreground dark:hover:bg-white/10"
          }`}
        >
          <Store className="h-4 w-4" />
          {text.wholesale}
        </button>
      </div>

      <div className="raised-panel rounded-2xl px-3 py-2 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-medium text-slate-600 dark:text-slate-300">
            {mode === "wholesale" ? text.wholesalePrice : text.retailPrice}
          </span>
          <span className="font-semibold text-slate-950 dark:text-white">
            {formatINR(activePrice)}
          </span>
        </div>
        {mode === "wholesale" ? (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {text.minimumQuantity} {minQty}
          </p>
        ) : null}
      </div>

      {product.variants && product.variants.length > 1 ? (
        <div className="space-y-3 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-950/5 dark:bg-white/[0.04] dark:ring-white/10">
          {variantGroups.map((group) => (
            <div key={group.name} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {group.name}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.values.map((value) => {
                  const matchingVariant = product.variants?.find((variant) =>
                    variant.attributes?.some(
                      (attribute) =>
                        attribute.name.toLowerCase() === group.name &&
                        attribute.value === value
                    )
                  );
                  const isSelected = selectedAttributes.some(
                    (attribute) =>
                      attribute.name.toLowerCase() === group.name &&
                      attribute.value === value
                  );

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setVariantId(matchingVariant?.id)}
                      className={`min-h-9 rounded-2xl border px-3 text-xs font-medium capitalize transition ${
                        isSelected
              ? "border-slate-950 bg-white text-slate-950 shadow-sm dark:border-white dark:bg-white dark:text-slate-950"
              : "border-transparent bg-white/70 text-slate-700 shadow-sm hover:bg-white dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
                      }`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-950/5 dark:bg-white/[0.04] dark:ring-white/10">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-950 dark:text-white">
            {text.variantDetails}
          </h2>
          <span className="rounded-full bg-slate-950 px-2 py-1 text-[10px] font-semibold uppercase text-white dark:bg-white dark:text-slate-950">
            Code128
          </span>
        </div>

        {barcodeImageUrl ? (
          <div className="mb-3 rounded-2xl bg-white p-3 shadow-inner shadow-slate-200/70">
            <Image
              src={barcodeImageUrl}
              alt={barcodeText}
              width={420}
              height={128}
              className="h-20 w-full object-contain"
              unoptimized
            />
          </div>
        ) : null}

        <div className="grid gap-2">
          {identityRows.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="grid grid-cols-[auto_minmax(78px,0.55fr)_1fr] items-center gap-2 rounded-2xl bg-white px-3 py-2 text-xs shadow-sm ring-1 ring-slate-950/5 dark:bg-white/5 dark:ring-white/10"
              >
                <Icon className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                <span className="font-medium text-slate-500 dark:text-slate-400">
                  {item.label}
                </span>
                <span className="min-w-0 break-all text-right font-semibold text-slate-950 dark:text-white">
                  {item.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="raised-panel inline-flex h-10 items-center gap-2 rounded-2xl px-1.5">
          <button
            type="button"
            aria-label={text.decreaseQuantity}
            onClick={() => updateQuantity(activeQty - 1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-2xl text-foreground hover:bg-white/50 dark:hover:bg-white/10"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-8 text-center text-sm font-semibold">
            {activeQty}
          </span>
          <button
            type="button"
            aria-label={text.increaseQuantity}
            onClick={() => updateQuantity(activeQty + 1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-2xl text-foreground hover:bg-white/50 dark:hover:bg-white/10"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          {Number(selectedVariant?.stock ?? 0) > 0
            ? `${selectedVariant?.stock} ${text.inStock}`
            : text.stockCheckout}
        </p>
      </div>

      <div className="neumorphic-card sticky bottom-3 z-30 -mx-1 grid gap-3 rounded-3xl p-2 sm:static sm:mx-0 sm:grid-cols-[1fr_1fr_auto] sm:!rounded-none sm:!border-0 sm:!bg-transparent sm:p-0 sm:!shadow-none sm:!backdrop-blur-0 sm:before:hidden dark:sm:!bg-transparent">
        <button
          type="button"
          onClick={handleAddToCart}
          className="soft-button h-10 gap-2 px-4 text-xs font-semibold"
        >
          <ShoppingBag className="h-4 w-4" />
          {text.addToCart}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          className="soft-button h-10 gap-2 px-4 text-xs font-semibold"
        >
          <Zap className="h-4 w-4" />
          {text.buyNow}
        </button>
        <button
          type="button"
          aria-label="Add to wishlist"
          onClick={() => toast.success(text.wishlistAdded)}
          className="soft-button soft-icon-btn h-10 min-w-10 px-3"
        >
          <Heart className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
