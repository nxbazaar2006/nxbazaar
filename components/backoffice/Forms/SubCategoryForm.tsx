"use client";

import React, { useMemo, useState } from "react";
import {
  useFieldArray,
  useForm,
  useWatch,
  type FieldErrors,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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

import { subCategorySchema } from "@/lib/validators/subcategory.schema";
import { generateSlug } from "@/lib/utils/Slug";
import type { SubCategory, SubCategoryFormData } from "@/types/subcategory";

type CategoryOption = {
  id: string;
  title: string;
};

type HsnCode = {
  id: string;
  code: string;
  title: string;
  gstRate: number;
};

interface Props {
  categories: CategoryOption[];
  hsnCodes: HsnCode[];
  updateData?: SubCategory;
}

const LOCALES = ["en", "hi", "mr"] as const;

type Locale = (typeof LOCALES)[number];

export default function SubCategoryForm({ categories, hsnCodes, updateData }: Props) {
  const router = useRouter();
  const id = updateData?.id;

  const [activeTab, setActiveTab] = useState<Locale>("en");
  const [imageUrl, setImageUrl] = useState(updateData?.imageUrl ?? "");

  const defaultTranslations = useMemo(
    () =>
      LOCALES.map((locale) => ({
        locale,
        title:
          updateData?.translations.find((item) => item.locale === locale)?.title ??
          "",
        description:
          updateData?.translations.find((item) => item.locale === locale)?.description ??
          "",
      })),
    [updateData]
  );

  const [selectedHsn, setSelectedHsn] = useState<HsnCode | null>(
    updateData?.hsnCodeId
      ? hsnCodes.find((item) => item.id === updateData.hsnCodeId) ?? null
      : null
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SubCategoryFormData>({
    resolver: zodResolver(subCategorySchema),
    defaultValues: {
      categoryId: updateData?.categoryId ?? "",
      imageUrl: updateData?.imageUrl ?? "",
      isActive: updateData?.isActive ?? true,
      hsnCodeId: updateData?.hsnCodeId ?? undefined,
      slug: updateData?.slug ?? "",
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

  const createMutation = useCreateSubCategory();
  const updateMutation = useUpdateSubCategory();

  const categoryOptions = categories.map((category) => ({
    label: category.title,
    value: category.id,
  }));

  async function onSubmit(data: SubCategoryFormData) {
    try {
      const englishTitle =
        data.translations.find((item) => item.locale === "en")?.title ??
        data.translations[0]?.title ??
        "";

      const payload = {
        ...data,
        imageUrl,
        slug: data.slug || generateSlug(englishTitle),
        hsnCodeId: data.hsnCodeId || undefined,
      };

      const res = id
        ? await updateMutation.mutateAsync({ id, data: payload })
        : await createMutation.mutateAsync(payload);

      if (!res?.success) {
        toast.error(res?.message ?? "Failed to save subcategory");
        return;
      }

      toast.success(res.message ?? "Saved successfully");

      if (!id) {
        reset({
          categoryId: "",
          imageUrl: "",
          isActive: true,
          hsnCodeId: undefined,
          slug: "",
          translations: LOCALES.map((locale) => ({
            locale,
            title: "",
            description: "",
          })),
        });
        setImageUrl("");
        setSelectedHsn(null);
      }

      router.push("/dashboard/subcategories");
      router.refresh();
    } catch {
      toast.error("Server error");
    }
  }

  function onInvalid(formErrors: FieldErrors<SubCategoryFormData>) {
    const translationErrors = formErrors.translations;

    if (Array.isArray(translationErrors)) {
      const firstInvalidIndex = translationErrors.findIndex(Boolean);

      if (firstInvalidIndex >= 0) {
        setActiveTab(fields[firstInvalidIndex]?.locale as Locale);
      }
    }

    toast.error("Please fill required fields");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
      <SelectInput
        label="Category"
        name="categoryId"
        register={register}
        errors={errors}
        options={categoryOptions}
      />

      <div className="flex gap-2 rounded-lg border p-1 w-fit">
        {LOCALES.map((locale) => (
          <button
            key={locale}
            type="button"
            onClick={() => setActiveTab(locale)}
            className={`rounded-md px-3 py-1.5 text-sm transition ${
              activeTab === locale
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            {locale.toUpperCase()}
          </button>
        ))}
      </div>

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

            <div className="text-sm text-muted-foreground">
              Slug: <span className="font-mono">/subcategory/{generateSlug(current?.title || "")}</span>
            </div>
          </div>
        );
      })}

      <div>
        <label className="text-sm font-medium">HSN Code</label>
        <HsnSearchSelect
          value={selectedHsn}
          onChange={(value) => {
            setSelectedHsn(value);
            setValue("hsnCodeId", value?.id ?? undefined, {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
        />
      </div>

      <ImageInput
        imageUrl={imageUrl}
        setImageUrl={setImageUrl}
        endpoint="subcategoryImageUploader"
        label="Image"
      />

      <ToggleInput label="Active" name="isActive" register={register} />

      <SubmitButton
        isLoading={createMutation.isPending || updateMutation.isPending}
        buttonTitle={id ? "Update SubCategory" : "Create SubCategory"}
        loadingButtonTitle={id ? "Updating..." : "Creating..."}
      />
    </form>
  );
}
