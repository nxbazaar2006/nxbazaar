"use client";

import {
  FormProvider,
  Resolver,
  useForm,
  useWatch,
} from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { generateSlug } from "@/lib/generateSlug";
import { toast } from "sonner";
import FormHeader from "@/components/backoffice/FormHeader";

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
  HsnCodeOption,
} from "@/types/subcategory";

import { IdSchema, OptionalString } from "@/lib/validators/common";

/* ================= SCHEMA ================= */

const subCategoryFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: OptionalString,
  locale: z.enum(["en", "hi", "mr", "EN", "HI", "MR"]).default("en"),
  categoryId: IdSchema,
  hsnCodeId: IdSchema.optional().or(z.literal("")),
  imageUrl: OptionalString,
  isActive: z.boolean().default(true),
});

/* ================= COMPONENT ================= */

type Props = {
  updateData?: SubCategory;
  categories?: Option[];
};

type ApiError = {
  message?: string;
};

export default function SubCategoryForm({
  updateData,
  categories = [],
}: Props) {
  const router = useRouter();

  const translation = updateData?.translations?.[0];
  const [selectedHsn, setSelectedHsn] = useState<HsnCodeOption | null>(
    updateData?.hsnCode ?? null
  );

  /* ================= FORM ================= */

  const form = useForm<SubCategoryFormValues>({
    resolver: zodResolver(subCategoryFormSchema) as Resolver<SubCategoryFormValues>,
    defaultValues: {
      title: translation?.title ?? "",
      description: translation?.description ?? "",
      locale: "en",
      categoryId: updateData?.categoryId ?? "",
      hsnCodeId: updateData?.hsnCodeId ?? "",
      isActive: updateData?.isActive ?? true,
      imageUrl: updateData?.imageUrl ?? "",
    },
  });

  /* ================= MUTATIONS ================= */

  const createMutation = useCreateSubCategory();
  const updateMutation = useUpdateSubCategory();
  const title = useWatch({
    control: form.control,
    name: "title",
  });

  /* ================= OPTIONS ================= */

  const categoryOptions = categories.map((cat) => ({
    id: cat.id,
    title: cat.title,
  }));

  /* ================= SUBMIT ================= */

  const onSubmit = (data: SubCategoryFormValues) => {
    const locale = data.locale.toLowerCase() as "en" | "hi" | "mr";

    const payload = {
      slug: generateSlug(data.title),
      imageUrl: data.imageUrl || "",
      isActive: data.isActive,
      categoryId: data.categoryId,
      hsnCodeId: data.hsnCodeId || null,
      translations: [
        {
          locale,
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
            form.reset();
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
        form.reset();
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

  /* ================= UI ================= */

  return (
    <div className="p-6 space-y-6">
      <FormHeader
        title={updateData ? "Update SubCategory" : "Create SubCategory"}
      />

      <div className="border bg-card text-card-foreground shadow-sm mx-auto max-w-7xl space-y-6 rounded-3xl p-4 sm:p-6">
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {/* CATEGORY */}
            <input type="hidden" {...form.register("hsnCodeId")} />

            <SelectInput
              label="Category"
              name="categoryId"
              options={categoryOptions}
            />

            {/* TITLE */}
            <TextInput
              label="Title"
              name="title"
              required
            />

            {/* DESCRIPTION */}
            <TextareaInput
              label="Description"
              name="description"
              languageName="locale"
              rows={6}
              features={{
                ai: true,
                voice: true,
                language: true,
                editor: true,
              }}
              aiPrompt={`Create an ecommerce subcategory description for ${
                title || "this subcategory"
              }`}
            />

            {/* IMAGE */}
            <ImageInput
              label="Image"
              name="imageUrl"
              endpoint="subcategoryImageUploader"
            />

            {/* HSN */}
            <SearchSelectInput<SubCategoryFormValues>
              value={selectedHsn}
              onChange={(value) => {
                setSelectedHsn(value);
                form.setValue("hsnCodeId", value?.id ?? "", {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                });
              }}
            />

            {/* STATUS */}
            <ToggleInput
              name="isActive"
              label="Status"
              trueTitle="Active"
              falseTitle="Inactive"
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
        </FormProvider>
      </div>
    </div>
  );
}
