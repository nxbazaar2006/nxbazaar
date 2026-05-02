import { db } from "@/lib/db";
import { getSafeTranslation } from "@/lib/getTranslation";
import { findEntityByTranslationSlug } from "@/lib/slug/translationSlug.service";

interface Props {
  params: {
    locale: string;
    slug: string;
  };
}

export default async function ProductLocalePage({ params }: Props) {
  const product = await findEntityByTranslationSlug(
    "product",
    params.locale,
    params.slug
  );

  const productData =
    product ??
    (await db.product.findFirst({
      where: { slug: params.slug },
      include: { translations: true },
    }));

  if (!productData) {
    return <div>Product not found</div>;
  }

  const t = getSafeTranslation(productData.translations, params.locale);

  return <div>{t?.title ?? "Product"}</div>;
}
