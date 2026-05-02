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
import ModularTextareaInput from "@/components/inputs/TextareaInput";
import ToggleInput from "@/components/FormInputs/ToggleInput";
import {
  LOCALES,
  productSchema,
  type ProductInput,
} from "@/lib/validators/productSchema";
import { generateBarcode } from "@/lib/generateBarcode";
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
  categories?: SelectOption[];
  subCategories?: SubCategoryOption[];
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

const randomCode = (length: number) =>
  Math.random()
    .toString(36)
    .replace(/[^a-z0-9]/gi, "")
    .toUpperCase()
    .slice(0, length)
    .padEnd(length, "0");

const generateSku = () => `SKU-${randomCode(8)}`;
const generateProductCode = () => `PC-${randomCode(10)}`;

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
    sku: generateSku(),
    barcode: generateBarcode(),
    productCode: generateProductCode(),
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
    const match = existing.find((translation) => translation.locale === locale);

    return {
      locale,
      description: match?.description ?? "",
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
    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-2">
      <input type="hidden" {...register(`translations.${index}.locale` as const)} />

      <TextareaInput
        label="Description"
        name={`translations.${index}.description`}
        languageName={`translations.${index}.locale`}
        placeholder="Write localized product description"
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
  const { control } = useFormContext<ProductInput>();
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
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <TextInput label="Title" name={`variants.${index}.title`} required />
        <TextInput label="SKU" name={`variants.${index}.sku`} />
        <TextInput label="Barcode" name={`variants.${index}.barcode`} />
        <TextInput label="Product Code" name={`variants.${index}.productCode`} />
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
            className="rounded border px-3 py-2 text-xs"
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
            className="rounded border px-3 py-2 text-xs"
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
  categories = [],
  subCategories = [],
  updateData = {},
}: Props) {
  const router = useRouter();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [tags, setTags] = useState<string[]>(updateData.tags ?? []);
  const [imageUrls, setImageUrls] = useState<string[]>(
    updateData.images?.map((img) => img.url) ?? []
  );
  const [selectedHsn, setSelectedHsn] = useState<HsnOption | null>(
    updateData.hsnCode ?? null
  );

  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: updateData.title ?? "",
      slug: updateData.slug ?? "",
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
      translations: updateData.translations ?? [
        {
          locale: "EN",
          title: "",
          description: "",
          metaTitle: "",
          metaDescription: "",
        },
      ],
      variants: updateData.variants ?? [
        {
          title: "Default Variant",
          sku: "",
          barcode: generateBarcode(),
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
    watch,
    formState: { errors },
  } = form;

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variants",
  });

  const { fields: translationFields, remove: removeTranslation } = useFieldArray({
    control,
    name: "translations",
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
  }, [autoSlug, productTitle, setValue]);

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
      variants: data.variants.map((variant) => ({
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

      <GlassCard className="max-w-7xl mx-auto space-y-6">
        <FormProvider {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <input type="hidden" {...register("userId")} />
          <input type="hidden" {...register("hsnCodeId")} />
          <input type="hidden" {...register("gstRate")} />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextInput label="Product Title" name="title" required />
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

            <ToggleInput
              label="Status"
              name="isActive"
              trueTitle="Active"
              falseTitle="Inactive"
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
            {translationFields.map((field, index) => (
              <TranslationCard
                key={field.id}
                index={index}
                aiPromptBase={productTitle || "this product"}
                canRemove={translationFields.length > 1}
                onRemove={() => removeTranslation(index)}
              />
            ))}
          </div>

          {translationFields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-2"
            >
              <SelectInput
                label="Language"
                name={`translations.${index}.locale`}
                register={register}
                error={errors.translations?.[index]?.locale}
                options={LOCALES.map((locale) => ({
                  label: locale,
                  value: locale,
                }))}
              />

              <TextInput
                label="Title"
                name={`translations.${index}.title`}
                register={register}
                errors={errors}
              />

              <ModularTextareaInput
                form={form}
                label="Description"
                name={`translations.${index}.description`}
                enableAI
                enableVoice
                enableLanguage
                editor="rich"
              />

              <button
                type="button"
                className="rounded bg-blue-500 px-4 py-2 text-sm text-white"
                onClick={() =>
                  appendVariant(defaultVariant(selectedCurrency, false))
                }
              >
                Add Variant
              </button>
            </div>

            {variantFields.map((field, index) => (
              <VariantCard
                key={field.id}
                index={index}
                canRemove={variantFields.length > 1}
                isDefault={Boolean(field.isDefault)}
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

          {variantFields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-2"
            >
              <TextInput
                label="Title"
                name={`variants.${index}.title`}
                register={register}
                errors={errors}
              />

              <TextInput
                label="SKU"
                name={`variants.${index}.sku`}
                register={register}
                errors={errors}
              />
              <TextInput
                label="Barcode"
                name={`variants.${index}.barcode`}
                register={register}
                errors={errors}
              />

              <TextInput
                label="Price"
                name={`variants.${index}.price`}
                type="number"
                register={register}
                errors={errors}
              />

              <TextInput
                label="Sale Price"
                name={`variants.${index}.salePrice`}
                type="number"
                register={register}
                errors={errors}
              />

              <TextInput
                label="Cost Price"
                name={`variants.${index}.costPrice`}
                type="number"
                register={register}
                errors={errors}
              />

              <TextInput
                label="Stock"
                name={`variants.${index}.stock`}
                type="number"
                register={register}
                errors={errors}
              />

              <ToggleInput
                label="Default Variant"
                name={`variants.${index}.isDefault`}
                register={register}
                trueTitle="Default"
                falseTitle="Normal"
              />

              <button
                type="button"
                className="self-end text-red-500"
                onClick={() => removeVariant(index)}
              >
                Remove
              </button>
            </div>
          ))}        </div>

        <SubmitButton
          isLoading={createProduct.isPending || updateProduct.isPending}
          buttonTitle={updateData.id ? "Update product" : "Create product"}
          loadingButtonTitle="Saving..."
        />
      </form>
    </div>
  );
}
