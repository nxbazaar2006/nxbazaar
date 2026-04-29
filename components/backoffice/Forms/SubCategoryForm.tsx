"use client";

import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { generateSlug } from "@/lib/generateSlug";
import { toast } from "sonner";
import { useState } from "react";

import {
  useUpdateSubCategory,
  useCreateSubCategory,
} from "@/hooks/useSubCategory";

import TextInput from "@/components/FormInputs/TextInput";
import TextareaInput from "@/components/FormInputs/TextAreaInput";
import SelectInput from "@/components/FormInputs/SelectInput";
import ToggleInput from "@/components/FormInputs/ToggleInput";
import SubmitButton from "@/components/FormInputs/SubmitButton";
import SearchSelectInput from "@/components/FormInputs/SearchSelectInput";
import ImageInput from "@/components/FormInputs/ImageInput";

import {
  Option,
  SubCategory,
  SubCategoryFormValues,
} from "@/types/subcategory";

import { IdSchema, OptionalString } from "@/lib/validators/common";

type Props = {
  updateData?: SubCategory;
  categories?: Option[];
};

type ApiError = {
  message?: string;
};

type HsnOption = {
  id: string;
  code: string;
  title: string;
  gstRate: number;
};

const subCategoryFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: OptionalString,
  categoryId: IdSchema,
  hsnCodeId: IdSchema.optional().or(z.literal("")),
  imageUrl: OptionalString,
  isActive: z.boolean().default(true),
});

export default function SubCategoryForm({
  updateData,
  categories = [],
}: Props) {
  const router = useRouter();

  const translation = updateData?.translations?.[0];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<SubCategoryFormValues>({
    resolver: zodResolver(subCategoryFormSchema),
    defaultValues: {
      title: translation?.title ?? "",
      description: translation?.description ?? "",
      categoryId: updateData?.categoryId ?? "",
      hsnCodeId: updateData?.hsnCodeId ?? "",
      isActive: updateData?.isActive ?? true,
      imageUrl: updateData?.imageUrl ?? "",
    },
  });

  const createMutation = useCreateSubCategory();
  const updateMutation = useUpdateSubCategory();

  const categoryOptions = categories.map((cat) => ({
    id: cat.id,
    title: cat.title,
  }));

  // ✅ SAFE WATCH
  const imageUrl = useWatch({
    control,
    name: "imageUrl",
  });

  const hsnCodeId = useWatch({
    control,
    name: "hsnCodeId",
  });

  // ✅ HSN STATE
  const [selectedHsnData, setSelectedHsnData] =
    useState<HsnOption | null>(null);

  // ✅ EDIT MODE SUPPORT
  const selectedHsn =
    updateData?.hsnCode && !selectedHsnData && !hsnCodeId
      ? {
          id: updateData.hsnCode.id,
          code: updateData.hsnCode.code,
          title: updateData.hsnCode.title,
          gstRate: updateData.hsnCode.gstRate,
        }
      : null;

  // ✅ SUBMIT
  const onSubmit = (data: SubCategoryFormValues) => {
    const payload = {
      slug: generateSlug(data.title),
      imageUrl: data.imageUrl || "",
      isActive: data.isActive,
      categoryId: data.categoryId,
      hsnCodeId: data.hsnCodeId || null,
      translations: [
        {
          locale: "en" as const,
          title: data.title,
          description: data.description,
        },
      ],
    };

    if (updateData?.id) {
      updateMutation.mutate(
        { id: updateData.id, data: payload },
        {
          onSuccess: () => {
            toast.success("SubCategory Updated Successfully");
            reset();
            router.push("/dashboard/subcategories");
            router.refresh();
          },
          onError: (error: ApiError) => {
            toast.error(error?.message ?? "Something went wrong");
          },
        }
      );

      return;
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("SubCategory Created Successfully");
        reset();
        router.push("/dashboard/subcategories");
        router.refresh();
      },
      onError: (error: ApiError) => {
        toast.error(error?.message ?? "Something went wrong");
      },
    });
  };

  const isLoading =
    createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      
      {/* CATEGORY */}
      <SelectInput<SubCategoryFormValues>
        label="Category"
        name="categoryId"
        options={categoryOptions}
        register={register}
        error={errors.categoryId}
      />

      {/* TITLE */}
      <TextInput
        label="Title"
        name="title"
        register={register}
        errors={errors}
      />

      {/* DESCRIPTION */}
      <TextareaInput
        label="Description"
        name="description"
        register={register}
        errors={errors}
      />

      {/* ✅ IMAGE (FIXED WITH ENDPOINT) */}
      <ImageInput
        label="Image"
        endpoint="subcategoryImageUploader"
        imageUrl={imageUrl ?? ""}
        setImageUrl={(url) =>
          setValue("imageUrl", url, {
            shouldValidate: true,
            shouldDirty: true,
          })
        }
      />

      {/* ✅ HSN (FULL FIX) */}
      <SearchSelectInput
        value={selectedHsnData ?? selectedHsn ?? null}
        onChange={(val: HsnOption | null) => {
          setSelectedHsnData(val);

          setValue("hsnCodeId", val?.id ?? "", {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
        }}
      />

      {/* STATUS */}
      <ToggleInput
        name="isActive"
        label="Status"
        register={register}
      />

      {/* SUBMIT */}
      <SubmitButton
        isLoading={isLoading}
        buttonTitle={
          updateData
            ? "Update SubCategory"
            : "Create SubCategory"
        }
        loadingButtonTitle={
          updateData ? "Updating..." : "Creating..."
        }
      />
    </form>
  );
}
