"use client";

import React, { useState } from "react";
import {
  useForm,
  useFieldArray,
  useWatch,
  type FieldErrors,
} from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";

import ImageInput from "@/components/FormInputs/ImageInput";
import SubmitButton from "@/components/FormInputs/SubmitButton";
import TextareaInput from "@/components/FormInputs/TextAreaInput";
import TextInput from "@/components/FormInputs/TextInput";
import ToggleInput from "@/components/FormInputs/ToggleInput";

import {
  useCreateCategory,
  useUpdateCategory,
} from "@/hooks/useCategoryMutation";

import { categorySchema } from "@/lib/validators/category.schema";
import { Category } from "@/types/category";
import { generateSlug } from "@/lib/utils/slug";

const LOCALES = ["en", "hi", "mr"] as const;
type Language = (typeof LOCALES)[number];

interface TranslationInput {
  locale: Language;
  title: string;
  description?: string;
}

interface CategoryFormData {
  imageUrl?: string;
  isActive: boolean;
  translations: TranslationInput[];
}

interface Props {
  updateData?: Category;
}

export default function NewCategoryForm({ updateData }: Props) {
  const router = useRouter();
  const id = updateData?.id;

  const [activeTab, setActiveTab] = useState<Language>("en");
  const [imageUrl, setImageUrl] = useState<string>(
    updateData?.imageUrl ?? ""
  );

  const defaultTranslations: TranslationInput[] = LOCALES.map(
    (locale) => ({
      locale,
      title:
        updateData?.translations?.find((t) => t.locale === locale)
          ?.title ?? "",
      description:
        updateData?.translations?.find((t) => t.locale === locale)
          ?.description ?? "",
    })
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      imageUrl: updateData?.imageUrl ?? "",
      isActive: updateData?.isActive ?? true,
      translations: defaultTranslations,
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "translations",
  });

  const watchedTranslations = useWatch({
    control,
    name: "translations",
    defaultValue: defaultTranslations,
  });

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  async function onSubmit(data: CategoryFormData) {
    try {
      const enTitle =
        data.translations.find((t) => t.locale === "en")?.title || "";

      const payload = {
        ...data,
        imageUrl,
        slug: generateSlug(enTitle),
      };

      const res = id
        ? await updateMutation.mutateAsync({ id, data: payload })
        : await createMutation.mutateAsync(payload);

      if (res?.success) {
        toast.success(res.message ?? "Success");

        if (!id) {
          reset();
          setImageUrl("");
        }

        router.push("/dashboard/categories");
        router.refresh();
      } else {
        toast.error(res?.message ?? "Failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error");
    }
  }

  function onInvalid(errors: FieldErrors<CategoryFormData>) {
    const translationErrors = errors.translations;

    if (Array.isArray(translationErrors)) {
      const firstInvalidIndex = translationErrors.findIndex(Boolean);

      if (firstInvalidIndex >= 0) {
        setActiveTab(fields[firstInvalidIndex]?.locale);
      }
    }

    toast.error("Please fill required fields");
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className="
        max-w-7xl mx-auto p-6 space-y-6
         dark:bg-black 
        rounded-2xl shadow-lg
      "
    >
     
           

      {/* 🔥 FIELDS */}
      {fields.map((field, index) => {
        if (field.locale !== activeTab) return null;

        const current = watchedTranslations?.[index];

        return (
          <div key={field.id} className="space-y-4">
            <TextInput
              label={`Title (${field.locale.toUpperCase()})`}
              name={`translations.${index}.title`}
              register={register}
              errors={errors}
              required
            />

            <TextareaInput
              label={`Description (${field.locale.toUpperCase()})`}
              name={`translations.${index}.description`}
              register={register}
              errors={errors}
            />

            {/* 🔥 SLUG PREVIEW */}
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Slug:
              <span className="ml-2 px-2 py-1 rounded bg-gray-200 dark:bg-zinc-800 font-mono">
                /category/{generateSlug(current?.title || "")}
              </span>
            </div>
          </div>
        );
      })}

      {/* 🔥 IMAGE */}
      <ImageInput
        imageUrl={imageUrl}
        setImageUrl={setImageUrl}
        endpoint="categoryImageUploader"
        label="Category Image"
      />

      {/* 🔥 STATUS */}
      <ToggleInput
        label="Publish Category"
        name="isActive"
        trueTitle="Active"
        falseTitle="Draft"
        register={register}
      />

      {/* 🔥 SUBMIT */}
      <SubmitButton
        isLoading={
          createMutation.isPending || updateMutation.isPending
        }
        buttonTitle={id ? "Update Category" : "Create Category"}
        loadingButtonTitle={id ? "Updating..." : "Creating..."}
      />
    </form>
  );
}