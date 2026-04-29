"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import FormHeader from "@/components/backoffice/FormHeader";
import TextInput from "@/components/FormInputs/TextInput";
import TextareaInput from "@/components/FormInputs/TextAreaInput";
import SelectInput from "@/components/FormInputs/SelectInput";
import ToggleInput from "@/components/FormInputs/ToggleInput";
import ArrayItemsInput from "@/components/FormInputs/ArrayItemsInput";
import MultipleImageInput from "@/components/FormInputs/MultipleImageInput";
import SubmitButton from "@/components/FormInputs/SubmitButton";
import SearchSelectInput from "@/components/FormInputs/SearchSelectInput";

import {
  productSchema,
  ProductInput,
} from "@/lib/validators/productSchema";

import { generateSlug } from "@/lib/generateSlug";
import { generateBarcode } from "@/lib/generateBarcode";

import {
  useCreateProduct,
  useUpdateProduct,
} from "@/hooks/useProduct";

/* ================= TYPES ================= */

type SelectOption = {
  id: string;
  title: string;
};

type SubCategoryOption = {
  id: string;
  title: string;
  categoryId: string;
  hsnCode?: {
    id: string;
    code: string;
    title: string;
    gstRate: number;
  } | null;
};

type HsnOption = {
  id: string;
  code: string;
  title: string;
  gstRate: number;
};

type Props = {
  categories?: SelectOption[];
  subCategories?: SubCategoryOption[];
  updateData?: Partial<ProductInput> & {
    id?: string;
    hsnCode?: HsnOption | null;
  };
};

/* ================= COMPONENT ================= */

export default function NewProductForm({
  categories = [],
  subCategories = [],
  updateData = {},
}: Props) {
  const router = useRouter();

  const [tags, setTags] = useState<string[]>(
    updateData?.tags ?? []
  );

  const [imageUrls, setImageUrls] = useState<string[]>(
    updateData?.images?.map((img) => img.url) ?? []
  );

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [selectedHsn, setSelectedHsn] =
    useState<HsnOption | null>(
      updateData?.hsnCode ?? null
    );

  /* ================= FORM ================= */

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),

    defaultValues: {
      title: updateData?.title ?? "",
      slug: updateData?.slug ?? "",
      unit: updateData?.unit ?? "",
      tags: updateData?.tags ?? [],
      currency: updateData?.currency ?? "INR",
      isActive: updateData?.isActive ?? true,
      isWholesale: updateData?.isWholesale ?? false,
      categoryId: updateData?.categoryId ?? "",
      subCategoryId: updateData?.subCategoryId ?? "",
      hsnCodeId: updateData?.hsnCodeId ?? "",
      gstRate:
        updateData?.gstRate ??
        updateData?.hsnCode?.gstRate ??
        undefined,
      images: updateData?.images ?? [],
      imageUrl: updateData?.imageUrl ?? "",

      translations:
        updateData?.translations ?? [
          {
            locale: "en",
            title: "",
            description: "",
          },
        ],

      variants:
        updateData?.variants ?? [
          {
            title: "Default Variant",
            sku: "",
            barcode: generateBarcode(),
            price: 0,
            salePrice: 0,
            costPrice: 0,
            stock: 0,
            image: "",
            isDefault: true,
            attributes: [],
            wholesalePricing: [],
          },
        ],
    },
  });

  /* ================= VARIANTS ================= */

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variants",
  });

  /* ================= WATCH ================= */

  const selectedCategoryId = watch("categoryId");
  const selectedSubCategoryId =
    watch("subCategoryId");

  /* ================= FILTER ================= */

  const filteredSubCategories =
    useMemo(() => {
      return subCategories.filter(
        (sub) =>
          sub.categoryId ===
          selectedCategoryId
      );
    }, [subCategories, selectedCategoryId]);

  const selectedSubCategory = useMemo(
    () =>
      filteredSubCategories.find(
        (sub) =>
          sub.id === selectedSubCategoryId
      ),
    [filteredSubCategories, selectedSubCategoryId]
  );

  /* ================= HSN AUTO ================= */

  useEffect(() => {
    if (selectedSubCategory?.hsnCode) {
      setSelectedHsn(selectedSubCategory.hsnCode);

      setValue(
        "hsnCodeId",
        selectedSubCategory.hsnCode.id
      );

      setValue(
        "gstRate",
        selectedSubCategory.hsnCode.gstRate
      );

      return;
    }

    setSelectedHsn(null);
    setValue("hsnCodeId", "");
    setValue("gstRate", undefined);
  }, [selectedSubCategory, setValue]);

  /* ================= SUBMIT ================= */

  const onSubmit = async (
    data: ProductInput
  ) => {
    try {
      const payload: ProductInput = {
        ...data,

        /* ✅ FIXED SLUG */
        slug: updateData?.id
          ? data.slug
          : generateSlug(data.title),

        tags,

        images: imageUrls.map(
          (url, index) => ({
            url,
            isPrimary: index === 0,
          })
        ),

        imageUrl: imageUrls[0] ?? "",
      };

      if (updateData?.id) {
        await updateProduct.mutateAsync({
          id: updateData.id,
          data: payload,
        });
      } else {
        await createProduct.mutateAsync(
          payload
        );
      }

      router.push("/dashboard/products");
    } catch (error) {
      console.error(
        "PRODUCT SAVE ERROR ❌",
        error
      );
      alert("Save failed");
    }
  };

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      <FormHeader
        title={
          updateData?.id
            ? "Update Product"
            : "Create Product"
        }
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <input
          type="hidden"
          {...register("hsnCodeId")}
        />
        <input
          type="hidden"
          {...register("gstRate")}
        />

        {/* BASIC */}
        <div className="grid grid-cols-2 gap-4">
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
            errors={errors}
            options={categories.map((c) => ({
              label: c.title,
              value: c.id,
            }))}
          />

          <SelectInput
            label="SubCategory"
            name="subCategoryId"
            register={register}
            errors={errors}
            options={filteredSubCategories.map(
              (s) => ({
                label: s.title,
                value: s.id,
              })
            )}
          />

          <SearchSelectInput
            value={selectedHsn}
            onChange={(v) => {
              setSelectedHsn(v);
              setValue("hsnCodeId", v.id);
              setValue("gstRate", v.gstRate);
            }}
          />

          <TextInput
            label="GST"
            name="gstRate"
            type="number"
            register={register}
            errors={errors}
            disabled
          />

          <ToggleInput
            label="Active"
            name="isActive"
            register={register}
          />

          <ToggleInput
            label="Wholesale"
            name="isWholesale"
            register={register}
          />
        </div>

        {/* TAGS */}
        <ArrayItemsInput
          items={tags}
          setItems={setTags}
          itemTitle="Tag"
        />

        {/* IMAGES */}
        <MultipleImageInput
          imageUrls={imageUrls}
          setImageUrls={setImageUrls}
          endpoint="multipleProductsUploader"
          label="Images"
          setValue={setValue}
        />

        {/* DESCRIPTION */}
        <TextareaInput
          label="Description"
          name="translations.0.description"
          register={register}
          errors={errors}
        />

        {/* VARIANTS */}
        <div className="space-y-6">
          <h2>Variants</h2>

          {variantFields.map((field, i) => (
            <div
              key={field.id}
              className="grid grid-cols-2 gap-4 border p-4"
            >
              <TextInput
                label="Title"
                name={`variants.${i}.title`}
                register={register}
                errors={errors}
              />

              <TextInput
                label="SKU"
                name={`variants.${i}.sku`}
                register={register}
                errors={errors}
              />

              <TextInput
                label="Barcode"
                name={`variants.${i}.barcode`}
                register={register}
                errors={errors}
              />

              <TextInput
                label="Price"
                name={`variants.${i}.price`}
                type="number"
                register={register}
                errors={errors}
              />

              <TextInput
                label="Sale Price"
                name={`variants.${i}.salePrice`}
                type="number"
                register={register}
                errors={errors}
              />

              <TextInput
                label="Stock"
                name={`variants.${i}.stock`}
                type="number"
                register={register}
                errors={errors}
              />

              <button
                type="button"
                onClick={() => removeVariant(i)}
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              appendVariant({
                title: "",
                sku: "",
                barcode: generateBarcode(),
                price: 0,
                salePrice: 0,
                costPrice: 0,
                stock: 0,
                image: "",
                isDefault: false,
                attributes: [],
                wholesalePricing: [],
              })
            }
          >
            Add Variant
          </button>
        </div>

        <SubmitButton
          isLoading={
            createProduct.isPending ||
            updateProduct.isPending
          }
          buttonTitle={
            updateData?.id
              ? "Update"
              : "Create"
          }
          loadingButtonTitle="Saving..."
        />
      </form>
    </div>
  );
}