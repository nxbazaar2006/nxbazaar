"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { slugify } from "@/lib/utils/slug";

// ✅ ENTERPRISE LOCALES
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

  // ✅ lowercase locale
  const [activeTab, setActiveTab] = useState<Language>("en");

  const [imageUrl, setImageUrl] = useState<string>(
    updateData?.imageUrl ?? ""
  );

  // ✅ dynamic translations (SCALABLE)
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
    watch,
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

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const watchedTranslations = watch("translations");

  // 🔥 SUBMIT
  async function onSubmit(data: CategoryFormData) {
    try {
      // ✅ slug from EN
      const enTitle =
        data.translations.find((t) => t.locale === "en")?.title || "";

      const payload = {
        ...data,
        imageUrl,
        slug: slugify(enTitle), // ✅ IMPORTANT FIX
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
    } catch (error: unknown) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unexpected server error"
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-4xl mx-auto p-6 space-y-6 bg-white dark:bg-zinc-900 rounded-xl shadow"
    >
      {/* 🔥 LANGUAGE TABS */}
      <div className="flex gap-2">
        {LOCALES.map((lang) => (
          <button
            type="button"
            key={lang}
            onClick={() => setActiveTab(lang)}
            className={`px-4 py-2 rounded ${
              activeTab === lang
                ? "bg-black text-white"
                : "bg-gray-200 dark:bg-zinc-800"
            }`}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>

      {/* 🔥 TRANSLATION FIELDS */}
      {fields.map((field, index) => {
        if (field.locale !== activeTab) return null;

        const current = watchedTranslations[index];

        return (
          <div key={field.id} className="space-y-4">
            <TextInput
              label={`Title (${field.locale.toUpperCase()})`}
              name={`translations.${index}.title`}
              register={register}
              errors={errors}
            />

            <TextareaInput
              label={`Description (${field.locale.toUpperCase()})`}
              name={`translations.${index}.description`}
              register={register}
              errors={errors}
            />

            {/* ✅ SLUG PREVIEW */}
            <div className="text-sm text-gray-500">
              Slug Preview:
              <span className="ml-2 px-2 py-1 bg-gray-200 dark:bg-zinc-800 rounded font-mono">
                /category/{slugify(current?.title || "")}
              </span>
            </div>
          </div>
        );
      })}

      {/* IMAGE */}
      <ImageInput
        imageUrl={imageUrl}
        setImageUrl={setImageUrl}
        endpoint="categoryImageUploader"
        label="Category Image"
      />

      {/* STATUS */}
      <ToggleInput
        label="Publish Category"
        name="isActive"
        trueTitle="Active"
        falseTitle="Draft"
        register={register}
      />

      {/* SUBMIT */}
      <SubmitButton
        isLoading={
          createMutation.isPending || updateMutation.isPending
        }
        buttonTitle={id ? "Update Category" : "Create Category"}
        loadingButtonTitle={
          id ? "Updating..." : "Creating..."
        }
      />
    </form>
  );
}