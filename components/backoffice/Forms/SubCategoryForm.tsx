"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { subCategorySchema } from "@/lib/validators/subcategory.schema";
import { SubCategoryPayload } from "@/types/subcategory";
import {
  useCreateSubCategory,
  useUpdateSubCategory,
} from "@/hooks/useSubCategory";

import TextInput from "@/components/FormInputs/TextInput";
import TextareaInput from "@/components/FormInputs/TextAreaInput";
import SelectInput from "@/components/FormInputs/SelectInput";
import ImageInput from "@/components/FormInputs/ImageInput";
import ToggleInput from "@/components/FormInputs/ToggleInput";
import SubmitButton from "@/components/FormInputs/SubmitButton";
import HsnSearchSelect from "@/components/FormInputs/HsnSearchSelect";

type CategoryOption = {
  id: string;
  title: string;
};

interface Props {
  categories: CategoryOption[];
  updateData?: SubCategoryPayload & { id: string };
}

export default function SubCategoryForm({
  categories,
  updateData,
}: Props) {
  const router = useRouter();

  const [imageUrl, setImageUrl] = useState<string>(
    updateData?.imageUrl ?? ""
  );

  const createMutation = useCreateSubCategory();
  const updateMutation = useUpdateSubCategory();

  const form = useForm<SubCategoryPayload>({
    resolver: zodResolver(subCategorySchema),
    defaultValues: {
      title: updateData?.title ?? "",
      description: updateData?.description ?? "",
      imageUrl: updateData?.imageUrl ?? "",
      isActive: updateData?.isActive ?? true,
      categoryId: updateData?.categoryId ?? "",
      hsnCodeId: updateData?.hsnCodeId ?? null,
      metaTitle: updateData?.metaTitle ?? "",
      metaDescription: updateData?.metaDescription ?? "",
    },
  });

  const categoryOptions = categories.map((c) => ({
    label: c.title,
    value: c.id,
  }));

  const onSubmit = (data: SubCategoryPayload) => {
    if (updateData?.id) {
      updateMutation.mutate(
        { id: updateData.id, data },
        {
          onSuccess: () => router.push("/dashboard/subcategories"),
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => router.push("/dashboard/subcategories"),
      });
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="max-w-5xl mx-auto p-6 space-y-6 border rounded-xl"
    >
      <SelectInput
        label="Category"
        name="categoryId"
        register={form.register}
        errors={form.formState.errors}
        options={categoryOptions}
      />

      <TextInput
        label="Title"
        name="title"
        register={form.register}
        errors={form.formState.errors}
      />

      <TextareaInput
        label="Description"
        name="description"
        register={form.register}
        errors={form.formState.errors}
      />

      <ImageInput
        label="Image"
        imageUrl={imageUrl}
        setImageUrl={(url) => {
          setImageUrl(url);
          form.setValue("imageUrl", url);
        }}
      />

      <ToggleInput
        label="Active"
        name="isActive"
        register={form.register}
      />

      <SubmitButton
        isLoading={
          createMutation.isPending || updateMutation.isPending
        }
        buttonTitle="Save"
        loadingButtonTitle="Saving..."
      />
    </form>
  );
}