export async function createProduct(
  input: ProductInput
): Promise<ActionResponse<ProductWithRelations>> {
  try {
    const data = productSchema.parse(input);
    const { images, variants, translations, ...productData } = data;

    const translationsWithSlug = await Promise.all(
      translations.map(async (t) => ({
        ...t,
        slug: await generateUniqueSlug(
          "product",
          t.locale,
          t.slug ?? t.title
        ),
      }))
    );

    const product = await db.product.create({
      data: {
        ...productData,
        images: { create: images },
        variants: {
          create: variants.map((v) => ({
            ...v,
            attributes: { create: v.attributes },
            wholesalePricing: { create: v.wholesalePricing },
          })),
        },
        translations: { create: translationsWithSlug },
      },
      include: {
        category: true,
        images: true,
        translations: true,
      },
    });

    return { success: true, data: product };
  } catch (error: unknown) {
    console.error("CREATE_PRODUCT_ERROR:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong",
    };
  }
}