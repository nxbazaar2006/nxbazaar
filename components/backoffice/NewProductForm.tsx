"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useForm,
  useFieldArray,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import FormHeader from "@/components/backoffice/FormHeader";
import TextInput from "@/components/FormInputs/TextInput";
import TextareaInput from "@/components/FormInputs/TextAreaInput";
import SelectInput from "@/components/FormInputs/SelectInput";
import ToggleInput from "@/components/FormInputs/ToggleInput";
import ArrayItemsInput from "@/components/FormInputs/ArrayItemsInput";
import MultipleImageInput from "@/components/FormInputs/MultipleImageInput";
import SubmitButton from "@/components/FormInputs/SubmitButton";

import {
  productSchema,
  ProductInput,
} from "@/lib/validators/productSchema";

import { generateSlug } from "@/lib/generateSlug";
import { generateBarcode } from "@/lib/generateBarcode";

import {
  useCreateProduct,
  useUpdateProduct,
} from "@/hooks/useProducts";

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
    gstRate: number;
  } | null;
};

type Props = {
  categories?: SelectOption[];
  subCategories?: SubCategoryOption[];
  updateData?: Partial<ProductInput> & {
    id?: string;
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
      imageUrl: updateData?.imageUrl ?? "",

      unit: updateData?.unit ?? "",
      tags: updateData?.tags ?? [],

      currency: updateData?.currency ?? "INR",

      isActive: updateData?.isActive ?? true,
      isWholesale:
        updateData?.isWholesale ?? false,

      categoryId:
        updateData?.categoryId ?? "",

      subCategoryId:
        updateData?.subCategoryId ?? "",

      hsnCodeId: updateData?.hsnCodeId ?? "",

      images:
        updateData?.images ?? [],

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

            attributes: [
              {
                name: "Size",
                value: "",
              },
            ],

            wholesalePricing: [
              {
                minQty: 1,
                price: 0,
              },
            ],
          },
        ],
    },
  });

  /* ================= FIELD ARRAYS ================= */

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variants",
  });

  /* ================= WATCH ================= */

  const selectedCategoryId =
    watch("categoryId");

  /* ================= FILTER SUBCATEGORY ================= */

  const filteredSubCategories =
    useMemo(() => {
      return subCategories.filter(
        (sub) =>
          sub.categoryId ===
          selectedCategoryId
      );
    }, [
      subCategories,
      selectedCategoryId,
    ]);

  /* ================= SUBMIT ================= */

  const onSubmit = async (
    data: ProductInput
  ) => {
    try {
      const payload: ProductInput = {
        ...data,

        slug: updateData?.id
          ? data.slug ??
            updateData.slug
          : generateSlug(data.title),

        tags,

        images: imageUrls.map(
          (url, index) => ({
            url,
            isPrimary: index === 0,
          })
        ),

        imageUrl:
          imageUrls?.[0] ?? "",
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

      router.push(
        "/dashboard/products"
      );
    } catch (error) {
      console.log(
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
        className="max-w-6xl mx-auto p-6 rounded-xl shadow bg-orange-400/20 backdrop-blur border border-orange-300/30 space-y-8"
      >
        {/* ================= BASIC ================= */}
        <div className="grid grid-cols-2 gap-4">
          <TextInput
            label="Product Title"
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
            options={categories.map(
              (cat) => ({
                label: cat.title,
                value: cat.id,
              })
            )}
          />

          <SelectInput
            label="Sub Category"
            name="subCategoryId"
            register={register}
            errors={errors}
            options={filteredSubCategories.map(
              (sub) => ({
                label: sub.title,
                value: sub.id,
              })
            )}
          />

          <ToggleInput
            label="Publish Product"
            name="isActive"
            register={register}
          />

          <ToggleInput
            label="Wholesale"
            name="isWholesale"
            register={register}
          />
        </div>

        {/* ================= TAGS ================= */}
        <ArrayItemsInput
          items={tags}
          setItems={setTags}
          itemTitle="Tag"
        />

        {/* ================= IMAGES ================= */}
        <MultipleImageInput
          imageUrls={imageUrls}
          setImageUrls={setImageUrls}
          endpoint="multipleProductsUploader"
          label="Product Images"
          setValue={setValue}
        />

        {/* ================= TRANSLATION ================= */}
        <TextareaInput
          label="Description"
          name="translations.0.description"
          register={register}
          errors={errors}
        />

        {/* ================= VARIANTS ================= */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold">
            Product Variants
          </h2>

          {variantFields.map(
            (field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-2 gap-4 border p-4 rounded-lg"
              >
                <TextInput
                  label="Variant Title"
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
                  label="Stock"
                  name={`variants.${index}.stock`}
                  type="number"
                  register={register}
                  errors={errors}
                />

                <button
                  type="button"
                  onClick={() =>
                    removeVariant(index)
                  }
                  className="text-red-500"
                >
                  Remove Variant
                </button>
              </div>
            )
          )}

          <button
            type="button"
            onClick={() =>
              appendVariant({
                title: "",
                sku: "",
                barcode:
                  generateBarcode(),
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
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Add Variant
          </button>
        </div>

        {/* ================= SUBMIT ================= */}
        <SubmitButton
          isLoading={
            createProduct.isPending ||
            updateProduct.isPending
          }
          buttonTitle={
            updateData?.id
              ? "Update Product"
              : "Create Product"
          }
          loadingButtonTitle="Please wait..."
        />
      </form>
    </div>
  );
}