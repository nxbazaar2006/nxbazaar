"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FormProvider,
  Resolver,
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import FormHeader from "@/components/backoffice/FormHeader";
import GlassCard from "@/components/GlassCard";
import ArrayItemsInput from "@/components/FormInputs/ArrayItemsInput";
import MultipleImageInput from "@/components/FormInputs/MultipleImageInput";
import SearchSelectInput from "@/components/FormInputs/SearchSelectInput";
import SelectInput from "@/components/FormInputs/SelectInput";
import SubmitButton from "@/components/FormInputs/SubmitButton";
import TextInput from "@/components/FormInputs/TextInput";
import TextareaInput from "@/components/FormInputs/TextAreaInput";
import ToggleInput from "@/components/FormInputs/ToggleInput";
import {
  LOCALES,
  productSchema,
  type ProductInput,
} from "@/lib/validators/productSchema";
import { generateSlug } from "@/lib/generateSlug";
import { useCreateProduct, useUpdateProduct } from "@/hooks/useProduct";

type SelectOption = {
  id: string;
  title: string;
};

type HsnOption = {
  id: string;
  code: string;
  title: string;
  gstRate: number;
};

type SubCategoryOption = {
  id: string;
  title: string;
  categoryId: string;
  hsnCode?: HsnOption | null;
};

type Props = {
  userId: string;
  vendorCode?: string | null;
  categories?: SelectOption[];
  subCategories?: SubCategoryOption[];
  transparentBackground?: boolean;
  updateData?: Partial<ProductInput> & {
    id?: string;
    hsnCode?: HsnOption | null;
  };
};

type TranslationCardProps = {
  index: number;
  aiPromptBase: string;
  canRemove: boolean;
  onRemove: () => void;
};

type VariantCardProps = {
  index: number;
  canRemove: boolean;
  isDefault: boolean;
  onRemove: () => void;
  onSetDefault: () => void;
};

const UNIT_OPTIONS = [
  { label: "Number", value: "number" },
  { label: "Qty", value: "qty" },
  { label: "Piece", value: "piece" },
  { label: "Pack", value: "pack" },
  { label: "Box", value: "box" },
  { label: "Dozen", value: "dozen" },
  { label: "Kg", value: "kg" },
  { label: "Gram", value: "gram" },
  { label: "Litre", value: "litre" },
  { label: "Meter", value: "meter" },
];

function defaultVariant(
  currency: ProductInput["currency"],
  isDefault = true
): ProductInput["variants"][number] {
  return {
    title: isDefault ? "Default Variant" : "",
    sku: "",
    barcode: "",
    productCode: "",
    price: 0,
    salePrice: undefined,
    costPrice: undefined,
    currency,
    stock: 0,
    reservedStock: 0,
    lowStockAlert: undefined,
    trackInventory: true,
    image: "",
    isActive: true,
    isDefault,
    attributes: [],
    wholesalePricing: [],
  };
}

function defaultTranslations(updateData: Props["updateData"]) {
  const existing = updateData?.translations ?? [];

  return LOCALES.map((locale) => {
    const match = existing.find(
      (translation: ProductInput["translations"][number]) =>
        translation.locale === locale
    );

    return {
      locale,
      title: match?.title ?? "",
      slug: match?.slug ?? "",
      description: match?.description ?? "",
      metaTitle: match?.metaTitle ?? "",
      metaDescription: match?.metaDescription ?? "",
    };
  });
}

function TranslationCard({
  index,
  aiPromptBase,
  canRemove,
  onRemove,
}: TranslationCardProps) {
  const { register } = useFormContext<ProductInput>();

  return (
    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-transparent p-4 shadow-none dark:border-white/10 md:grid-cols-2">
      <input type="hidden" {...register(`translations.${index}.locale` as const)} />

      <TextareaInput
        label="English Description"
        name={`translations.${index}.description`}
        languageName={`translations.${index}.locale`}
        rows={6}
        features={{
          ai: true,
          voice: true,
          language: true,
          editor: true,
        }}
        aiPrompt={`Create an ecommerce product description for ${aiPromptBase}`}
        className="md:col-span-2"
      />

      {canRemove && (
        <button
          type="button"
          className="justify-self-start text-sm text-red-500"
          onClick={onRemove}
        >
          Remove translation
        </button>
      )}
    </div>
  );
}

function VariantCard({
  index,
  canRemove,
  isDefault,
  onRemove,
  onSetDefault,
}: VariantCardProps) {
  const { control, register } = useFormContext<ProductInput>();
  const attributeName = `variants.${index}.attributes` as const;
  const wholesaleName = `variants.${index}.wholesalePricing` as const;

  const { fields: attributeFields, append: appendAttribute, remove: removeAttribute } =
    useFieldArray({
      control,
      name: attributeName,
    });

  const {
    fields: wholesaleFields,
    append: appendWholesale,
    remove: removeWholesale,
  } = useFieldArray({
      control,
    name: wholesaleName,
  });

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-transparent p-4 shadow-none dark:border-white/10">
      <input type="hidden" {...register(`variants.${index}.sku` as const)} />
      <input type="hidden" {...register(`variants.${index}.id` as const)} />
      <input type="hidden" {...register(`variants.${index}.barcode` as const)} />
      <input type="hidden" {...register(`variants.${index}.productCode` as const)} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <TextInput label="Title" name={`variants.${index}.title`} required />
        <TextInput label="Price" name={`variants.${index}.price`} type="number" required />
        <TextInput label="Sale Price" name={`variants.${index}.salePrice`} type="number" />
        <TextInput label="Cost Price" name={`variants.${index}.costPrice`} type="number" />
        <TextInput label="Stock" name={`variants.${index}.stock`} type="number" />
        <TextInput label="Reserved Stock" name={`variants.${index}.reservedStock`} type="number" />
        <TextInput label="Low Stock Alert" name={`variants.${index}.lowStockAlert`} type="number" />
        <SelectInput
          label="Currency"
          name={`variants.${index}.currency`}
          options={[
            { label: "INR", value: "INR" },
            { label: "USD", value: "USD" },
          ]}
        />
        <ToggleInput
          label="Inventory Tracking"
          name={`variants.${index}.trackInventory`}
          trueTitle="Tracked"
          falseTitle="Manual"
        />
        <ToggleInput
          label="Active"
          name={`variants.${index}.isActive`}
          trueTitle="Active"
          falseTitle="Inactive"
        />
        <ToggleInput
          label="Default"
          name={`variants.${index}.isDefault`}
          trueTitle="Default"
          falseTitle="Secondary"
        />
        <div className="flex items-end gap-3 md:col-span-3">
          <button
            type="button"
            className="rounded border px-3 py-2 text-sm"
            onClick={onSetDefault}
          >
            {isDefault ? "Default Variant" : "Set Default"}
          </button>

          {canRemove && (
            <button
              type="button"
              className="rounded border border-red-200 px-3 py-2 text-sm text-red-500"
              onClick={onRemove}
            >
              Remove
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Attributes</h3>
          <button
            type="button"
            className="rounded-full bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-fuchsia-500/20 transition hover:from-orange-400 hover:via-fuchsia-400 hover:to-sky-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
            onClick={() =>
              appendAttribute({
                name: "",
                value: "",
              })
            }
          >
            Add Attribute
          </button>
        </div>

        {attributeFields.map((attribute, attributeIndex) => (
          <div key={attribute.id} className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <TextInput
              label="Attribute Name"
              name={`variants.${index}.attributes.${attributeIndex}.name`}
            />
            <TextInput
              label="Attribute Value"
              name={`variants.${index}.attributes.${attributeIndex}.value`}
            />
            <div className="flex items-end">
              <button
                type="button"
                className="rounded border border-red-200 px-3 py-2 text-sm text-red-500"
                onClick={() => removeAttribute(attributeIndex)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Wholesale Pricing</h3>
          <button
            type="button"
            className="rounded-full bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-fuchsia-500/20 transition hover:from-orange-400 hover:via-fuchsia-400 hover:to-sky-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
            onClick={() =>
              appendWholesale({
                minQty: 1,
                price: 0,
              })
            }
          >
            Add Tier
          </button>
        </div>

        {wholesaleFields.map((tier, tierIndex) => (
          <div key={tier.id} className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <TextInput
              label="Min Qty"
              name={`variants.${index}.wholesalePricing.${tierIndex}.minQty`}
              type="number"
            />
            <TextInput
              label="Wholesale Price"
              name={`variants.${index}.wholesalePricing.${tierIndex}.price`}
              type="number"
            />
            <div className="flex items-end">
              <button
                type="button"
                className="rounded border border-red-200 px-3 py-2 text-sm text-red-500"
                onClick={() => removeWholesale(tierIndex)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NewProductForm({
  userId,
  vendorCode,
  categories = [],
  subCategories = [],
  transparentBackground = false,
  updateData = {},
}: Props) {
  const router = useRouter();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema) as Resolver<ProductInput>,
    defaultValues: {
      title: updateData.title ?? "",
      vendorCode: vendorCode?.trim() || userId,
      slug: updateData.slug ?? "",
      productCode: updateData.productCode ?? "",
      imageUrl: updateData.imageUrl ?? "",
      tags: updateData.tags ?? [],
      unit: updateData.unit ?? "",
      isActive: updateData.isActive ?? true,
      isWholesale: updateData.isWholesale ?? false,
      currency: updateData.currency ?? "INR",
      gstRate: updateData.gstRate ?? updateData.hsnCode?.gstRate ?? undefined,
      categoryId: updateData.categoryId ?? "",
      subCategoryId: updateData.subCategoryId ?? "",
      userId: updateData.userId ?? userId,
      hsnCodeId: updateData.hsnCodeId ?? updateData.hsnCode?.id ?? "",
      images: updateData.images ?? [],
      translations: defaultTranslations(updateData),
      variants: updateData.variants ?? [
        {
          title: "Default Variant",
          sku: "",
          barcode: "",
          productCode: "",
          price: 0,
          salePrice: 0,
          costPrice: 0,
          currency: updateData.currency ?? "INR",
          stock: 0,
          reservedStock: 0,
          lowStockAlert: 0,
          trackInventory: true,
          image: "",
          isActive: true,
          isDefault: true,
          attributes: [],
          wholesalePricing: [],
        },
      ],    },
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = form;

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variants",
    keyName: "fieldId",
  });

  const { fields: translationFields, remove: removeTranslation } = useFieldArray({
    control,
    name: "translations",
    keyName: "fieldId",
  });

  const selectedCategoryId = useWatch({
    control,
    name: "categoryId",
  });
  const selectedSubCategoryId = useWatch({
    control,
    name: "subCategoryId",
  });
  const selectedHsnCodeId = useWatch({
    control,
    name: "hsnCodeId",
  });
  const selectedCurrency =
    useWatch({
      control,
      name: "currency",
    }) ?? "INR";
  const productTitle = useWatch({
    control,
    name: "title",
  });
  const displayVendorCode = vendorCode?.trim() || userId;
  const autoSlug = useMemo(
    () => generateSlug(productTitle || ""),
    [productTitle]
  );

  const filteredSubCategories = useMemo(
    () =>
      subCategories.filter(
        (subCategory) => subCategory.categoryId === selectedCategoryId
      ),
    [selectedCategoryId, subCategories]
  );

  const selectedSubCategory = useMemo(
    () =>
      filteredSubCategories.find(
        (subCategory) => subCategory.id === selectedSubCategoryId
      ),
    [filteredSubCategories, selectedSubCategoryId]
  );

  const selectedHsn = useMemo(() => {
    const hsnCode = selectedSubCategory?.hsnCode;

    if (hsnCode?.id === selectedHsnCodeId) {
      return hsnCode;
    }

    return updateData.hsnCode?.id === selectedHsnCodeId
      ? updateData.hsnCode
      : null;
  }, [selectedHsnCodeId, selectedSubCategory, updateData.hsnCode]);

  useEffect(() => {
    if (selectedSubCategory?.hsnCode) {
      setValue("hsnCodeId", selectedSubCategory.hsnCode.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("gstRate", selectedSubCategory.hsnCode.gstRate, {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    setValue("hsnCodeId", "", { shouldDirty: true, shouldValidate: true });
    setValue("gstRate", undefined, { shouldDirty: true, shouldValidate: true });
  }, [selectedSubCategory, setValue]);

  useEffect(() => {
    if (!productTitle) return;

    setValue("slug", autoSlug, {
      shouldDirty: true,
      shouldValidate: true,
    });

    translationFields.forEach((_, index) => {
      setValue(`translations.${index}.title`, productTitle, {
        shouldDirty: true,
        shouldValidate: true,
      });
    });
  }, [autoSlug, productTitle, setValue, translationFields]);

  const setDefaultVariant = (defaultIndex: number) => {
    variantFields.forEach((_, index) => {
      setValue(`variants.${index}.isDefault`, index === defaultIndex, {
        shouldDirty: true,
        shouldValidate: true,
      });
    });
  };

  const onSubmit = async (data: ProductInput) => {
    const firstImage = data.images[0]?.url ?? data.imageUrl ?? "";
    const payload: ProductInput = {
      ...data,
      slug: data.slug?.trim() || generateSlug(data.title),
      userId: updateData.userId ?? userId,
      imageUrl: firstImage,
      variants: data.variants.map((variant: ProductInput["variants"][number]) => ({
        ...variant,
        currency: variant.currency ?? data.currency,
      })),
    };

    try {
      if (updateData.id) {
        await updateProduct.mutateAsync({
          id: updateData.id,
          data: payload,
        });
      } else {
        await createProduct.mutateAsync(payload);
      }

      router.push("/dashboard/products");
      router.refresh();
    } catch (error) {
      console.error("PRODUCT_SAVE_ERROR", error);
      alert("Save failed");
    }
  };

  return (
    <div className="space-y-6">
      <FormHeader title={updateData.id ? "Update Product" : "Create Product"} />

      <GlassCard
        className={`mx-auto max-w-7xl space-y-6 ${
          transparentBackground
            ? "!border-slate-200 !bg-white/90 !shadow-xl !shadow-slate-200/60 hover:!bg-white/90 dark:!border-white/10 dark:!bg-slate-900/60 dark:!shadow-black/20"
            : "!border-slate-200 !bg-white/90 !shadow-xl !shadow-slate-200/60 hover:!bg-white/90 dark:!border-white/10 dark:!bg-slate-900/60 dark:!shadow-black/20"
        }`}
      >
        <FormProvider {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <input type="hidden" {...register("userId")} />
          <input type="hidden" {...register("productCode")} />
          <input type="hidden" {...register("hsnCodeId")} />
          <input type="hidden" {...register("gstRate")} />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextInput label="Product Title (English)" name="title" required />
            <TextInput
              label="Slug"
              name="slug"
              placeholder="Auto-generated from title"
              readOnly
            />
            <SelectInput
              label="Unit"
              name="unit"
              options={UNIT_OPTIONS}
              placeholder="Select unit"
            />
            <SelectInput
              label="Category"
              name="categoryId"
              options={categories.map((category) => ({
                label: category.title,
                value: category.id,
              }))}
            />

            <SelectInput
              label="SubCategory"
              name="subCategoryId"
              options={filteredSubCategories.map((subCategory) => ({
                label: subCategory.title,
                value: subCategory.id,
              }))}
            />

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">
                HSN Code
              </label>
              <SearchSelectInput<ProductInput>
                value={selectedHsn}
                onChange={(value: HsnOption | null) => {
                  setValue("hsnCodeId", value?.id ?? "", {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  setValue("gstRate", value?.gstRate, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              />
            </div>

            <SelectInput
              label="Currency"
              name="currency"
              options={[
                { label: "INR", value: "INR" },
                { label: "USD", value: "USD" },
              ]}
            />

            <SelectInput
              label="Vendor Code"
              name="vendorCode"
              options={[
                {
                  label: displayVendorCode,
                  value: displayVendorCode,
                },
              ]}
              placeholder="Select vendor code"
            />

            <ToggleInput
              label="Wholesale"
              name="isWholesale"
              trueTitle="Yes"
              falseTitle="No"
            />
          </div>

          <ArrayItemsInput name="tags" label="Tags" placeholder="Add tag" />

          <MultipleImageInput
            name="images"
            endpoint="multipleProductsUploader"
            label="Images"
          />

          <div className="space-y-4">
            {translationFields.map((field, index) => {
              const translationField = field as typeof field &
                ProductInput["translations"][number];

              if (translationField.locale !== "EN") {
                return (
                  <input
                    key={field.fieldId}
                    type="hidden"
                    {...register(`translations.${index}.locale` as const)}
                  />
                );
              }

              return (
                <TranslationCard
                  key={field.fieldId}
                  index={index}
                  aiPromptBase={productTitle || "this product"}
                  canRemove={false}
                  onRemove={() => removeTranslation(index)}
                />
              );
            })}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Variants</h2>
              <button
                type="button"
                className="rounded-full bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-fuchsia-500/20 transition hover:from-orange-400 hover:via-fuchsia-400 hover:to-sky-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
                onClick={() =>
                  appendVariant(defaultVariant(selectedCurrency, false))
                }
              >
                Add Variant
              </button>
            </div>

            {variantFields.map((field, index) => (
              <VariantCard
                key={field.fieldId}
                index={index}
                canRemove={variantFields.length > 1}
                isDefault={Boolean(
                  (field as typeof field & ProductInput["variants"][number])
                    .isDefault
                )}
                onSetDefault={() => setDefaultVariant(index)}
                onRemove={() => removeVariant(index)}
              />
            ))}

            {errors.variants?.message && (
              <p className="text-sm text-red-500">
                {String(errors.variants.message)}
              </p>
            )}
          </div>

          <SubmitButton
            isLoading={createProduct.isPending || updateProduct.isPending}
            buttonTitle={updateData.id ? "Update product" : "Create product"}
            loadingButtonTitle="Saving..."
          />
          </form>
        </FormProvider>
      </GlassCard>
    </div>
  );
}
