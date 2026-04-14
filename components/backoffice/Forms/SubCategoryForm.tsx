"use client";

import React, { useState } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  useCreateSubCategory,
  useUpdateSubCategory,
} from "@/hooks/useSubCategory";

import TextInput from "@/components/FormInputs/TextInput";
import TextareaInput from "@/components/FormInputs/TextAreaInput";
import ImageInput from "@/components/FormInputs/ImageInput";
import ToggleInput from "@/components/FormInputs/ToggleInput";
import SubmitButton from "@/components/FormInputs/SubmitButton";
import SelectInput from "@/components/FormInputs/SelectInput";
import HsnSearchSelect from "@/components/FormInputs/HsnSearchSelect";

import { SubCategoryFormData } from "@/types/subcategory";
import { generateSlug } from "@/lib/utils/slug";

type CategoryOption = {
  id: string;
  title: string;
};

type HsnCode = {
  id: string;
  code: string;
};

interface Props {
  categories: CategoryOption[];
  hsnCodes: HsnCode[];
  updateData?: SubCategoryFormData & { id: string };
}

export default function SubCategoryForm({
  categories,
  hsnCodes,
  updateData,
}: Props) {
  const router = useRouter();
  const id = updateData?.id;

  const [imageUrl, setImageUrl] = useState(
    updateData?.imageUrl ?? ""
  );

  const [selectedHsn, setSelectedHsn] = useState<HsnCode | null>(
    updateData?.hsnCodeId
      ? hsnCodes.find((h) => h.id === updateData.hsnCodeId) ?? null
      : null
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SubCategoryFormData>({
    defaultValues: {
      categoryId: updateData?.categoryId ?? "",
      title: updateData?.title ?? "",
      description: updateData?.description ?? "",
      imageUrl,
      isActive: updateData?.isActive ?? true,
      hsnCodeId: updateData?.hsnCodeId ?? null,
    },
  });

  const createMutation = useCreateSubCategory();
  const updateMutation = useUpdateSubCategory();

  const categoryOptions = categories.map((c) => ({
    label: c.title,
    value: c.id,
  }));

  /* ================= SUBMIT ================= */

  async function onSubmit(data: SubCategoryFormData) {
    console.log("FORM SUBMIT 👉", data);

    try {
     const payload = {
  categoryId: data.categoryId,
  title: data.title,
  description: data.description ?? "",
  imageUrl,
  isActive: data.isActive,
  hsnCodeId: data.hsnCodeId,
  slug: generateSlug(data.title),
};

        console.log("CLEAN PAYLOAD ✅", payload);

      const res = id
        ? await updateMutation.mutateAsync({ id, data: payload })
        : await createMutation.mutateAsync(payload);

      if (!res?.success) {
        toast.error(res?.message ?? "Failed");
        return;
      }

      toast.success("Success");

      if (!id) {
        reset();
        setImageUrl("");
        setSelectedHsn(null);
      }

      router.push("/dashboard/subcategories");
    } catch (error) {
      console.log(error);
      toast.error("Server error");
    }
  }

  function onInvalid(errors: FieldErrors<SubCategoryFormData>) {
    console.log("ERRORS ❌", errors);
    toast.error("Fill required fields");
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className="space-y-6"
    >
      {/* CATEGORY */}
      <SelectInput
        label="Category"
        name="categoryId"
        register={register}
        errors={errors}
        options={categoryOptions}
      />

      {/* TITLE */}
      <TextInput
        label="Title"
        name="title"
        register={register}
        errors={errors}
        required
      />

      {/* DESCRIPTION */}
      <TextareaInput
        label="Description"
        name="description"
        register={register}
        errors={errors}
      />

      {/* HSN */}
      <div>
        <label className="text-sm font-medium">HSN Code</label>
        <HsnSearchSelect
          value={selectedHsn}
          onChange={(value) => {
            setSelectedHsn(value);
            setValue("hsnCodeId", value?.id ?? null);
          }}
        />
      </div>

      {/* IMAGE */}
      <ImageInput
        imageUrl={imageUrl}
        setImageUrl={setImageUrl}
        endpoint="subcategoryImageUploader"
        label="Image"
      />

      {/* STATUS */}
      <ToggleInput
        label="Active"
        name="isActive"
        register={register}
      />

      {/* SUBMIT */}
      <SubmitButton
        isLoading={
          createMutation.isPending || updateMutation.isPending
        }
        buttonTitle={id ? "Update SubCategory" : "Create SubCategory"}
        loadingButtonTitle="Saving..."
      />
    </form>
  );
}