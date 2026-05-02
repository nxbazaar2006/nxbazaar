"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import FormHeader from "@/components/backoffice/FormHeader";
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
      tags: updateData.tags ?? [],
      unit: updateData.unit ?? "",
      isActive: updateData.isActive ?? true,
      isWholesale: updateData.isWholesale ?? false,
      currency: updateData.currency ?? "INR",
      categoryId: updateData.categoryId ?? "",
      subCategoryId: updateData.subCategoryId ?? "",
      userId: updateData.userId ?? userId,
      hsnCodeId: updateData.hsnCodeId ?? "",
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

  const {
    fields: translationFields,
    append: appendTranslation,
    remove: removeTranslation,
  } = useFieldArray({
    control,
    name: "translations",
  });

  const selectedCategoryId = watch("categoryId");
  const selectedSubCategoryId = watch("subCategoryId");

  const filteredSubCategories = useMemo(
    () =>
      subCategories.filter((sub) => sub.categoryId === selectedCategoryId),
    [selectedCategoryId, subCategories]
  );

  const selectedSubCategory = useMemo(
    () => filteredSubCategories.find((sub) => sub.id === selectedSubCategoryId),
    [filteredSubCategories, selectedSubCategoryId]
  );

  useEffect(() => {
    if (selectedSubCategory?.hsnCode) {
      setSelectedHsn(selectedSubCategory.hsnCode);
      setValue("hsnCodeId", selectedSubCategory.hsnCode.id);
      return;
    }

    setSelectedHsn(null);
    setValue("hsnCodeId", "");
  }, [selectedSubCategory, setValue]);

  const onSubmit = async (data: ProductInput) => {
    const payload: ProductInput = {
      ...data,
      slug: data.slug?.trim() || generateSlug(data.title),
      userId: updateData.userId ?? userId,
      tags,
      images: imageUrls.map((url, index) => ({
        url,
        isPrimary: index === 0,
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
    } catch (error) {
      console.error("PRODUCT_SAVE_ERROR", error);
      alert("Save failed");
    }
  };

  return (
    <div className="space-y-6">
      <FormHeader
        title={updateData.id ? "Update Product" : "Create Product"}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <input type="hidden" {...register("userId")} />
        <input type="hidden" {...register("hsnCodeId")} />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextInput
            label="Title"
            name="title"
            register={register}
            errors={errors}
          />

          <TextInput
            label="Unit"
            name="unit"
            register={register}
            errors={errors}
          />

          <SelectInput
            label="Category"
            name="categoryId"
            register={register}
            error={errors.categoryId}
            options={categories.map((category) => ({
              label: category.title,
              value: category.id,
            }))}
          />

          <SelectInput
            label="SubCategory"
            name="subCategoryId"
            register={register}
            error={errors.subCategoryId}
            options={filteredSubCategories.map((subCategory) => ({
              label: subCategory.title,
              value: subCategory.id,
            }))}
          />

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">
              HSN Code
            </label>
            <SearchSelectInput
              value={selectedHsn}
              onChange={(value) => {
                setSelectedHsn(value);
                setValue("hsnCodeId", value?.id ?? "");
              }}
            />
          </div>

          <SelectInput
            label="Currency"
            name="currency"
            register={register}
            error={errors.currency}
            options={[
              { label: "INR", value: "INR" },
              { label: "USD", value: "USD" },
            ]}
          />

          <ToggleInput
            label="Status"
            name="isActive"
            register={register}
            trueTitle="Active"
            falseTitle="Inactive"
          />

          <ToggleInput
            label="Wholesale"
            name="isWholesale"
            register={register}
            trueTitle="Yes"
            falseTitle="No"
          />
        </div>

        <ArrayItemsInput label="Tags" items={tags} setItems={setTags} />

        <MultipleImageInput
          imageUrls={imageUrls}
          setImageUrls={setImageUrls}
          endpoint="multipleProductsUploader"
          label="Images"
          setValue={setValue}
        />

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Translations</h2>
            <button
              type="button"
              className="rounded bg-blue-500 px-4 py-2 text-white"
              onClick={() =>
                appendTranslation({
                  locale: "EN",
                  title: "",
                  description: "",
                  metaTitle: "",
                  metaDescription: "",
                })
              }
            >
              Add Language
            </button>
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
                className="self-end text-red-500"
                onClick={() => removeTranslation(index)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Variants</h2>
            <button
              type="button"
              className="rounded bg-blue-500 px-4 py-2 text-white"
              onClick={() =>
                appendVariant({
                  title: "",
                  sku: "",
                  barcode: generateBarcode(),
                  price: 0,
                  salePrice: 0,
                  costPrice: 0,
                  currency: watch("currency") ?? "INR",
                  stock: 0,
                  reservedStock: 0,
                  lowStockAlert: 0,
                  trackInventory: true,
                  image: "",
                  isActive: true,
                  isDefault: false,
                  attributes: [],
                  wholesalePricing: [],
                })
              }
            >
              Add Variant
            </button>
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
