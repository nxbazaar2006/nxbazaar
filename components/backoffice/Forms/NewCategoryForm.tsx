"use client";

import FormHeader from "@/components/backoffice/FormHeader";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CategoryInput } from "@/lib/validators/category.schema";
import { useToast } from "@/components/ui/use-toast";
import {
  useCreateCategory,
  useUpdateCategory,
} from "@/hooks/useCategory";
import { useRouter } from "next/navigation";

import TextInput from "@/components/FormInputs/TextInput";
import TextareaInput from "@/components/FormInputs/TextAreaInput";
import ToggleInput from "@/components/FormInputs/ToggleInput";
import ImageInput from "@/components/FormInputs/ImageInput";
import SubmitButton from "@/components/FormInputs/SubmitButton";

/* ================= SCHEMA ================= */

const CategoryFormSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  imageUrl: z.string().optional().or(z.literal("")),
  isActive: z.boolean(),
  locale: z.enum(["EN", "HI", "MR"]),
});

type CategoryFormValues = z.infer<typeof CategoryFormSchema>;

type Props = {
  initialData?: {
    id?: string;
    title?: string;
    description?: string;
    imageUrl?: string;
    isActive?: boolean;
    locale?: "EN" | "HI" | "MR";
  };
};

export default function CategoryForm({ initialData }: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const id = initialData?.id;

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory(id ?? "");

  /* ================= FORM ================= */

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(CategoryFormSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      imageUrl: initialData?.imageUrl ?? "",
      isActive: initialData?.isActive ?? true,
      locale: initialData?.locale ?? "EN",
    },
  });

  /* ================= SUBMIT ================= */

  const onSubmit = async (data: CategoryFormValues) => {
    const payload: CategoryInput = {
      imageUrl: data.imageUrl,
      isActive: data.isActive,
      translations: [
        {
          locale: data.locale,
          title: data.title,
          description: data.description,
        },
      ],
    };

    try {
      if (id) {
        await updateMutation.mutateAsync(payload);
        toast({
          title: "Success 🎉",
          description: "Category updated successfully",
        });
      } else {
        await createMutation.mutateAsync(payload);
        toast({
          title: "Success 🎉",
          description: "Category created successfully",
        });
      }

      router.push("/dashboard/categories");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error ❌",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const isLoading =
    createMutation.isPending || updateMutation.isPending;
  const title = useWatch({
    control: form.control,
    name: "title",
  });

  /* ================= UI ================= */

  return (
    <div className="p-6 space-y-6">
      <FormHeader
        title={id ? "Update Category" : "Create Category"}
      />

      <div className="border bg-card text-card-foreground shadow-sm mx-auto max-w-7xl space-y-6 rounded-3xl p-4 sm:p-6">
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {/* TITLE */}
            <TextInput
              label="Category Title"
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
              aiPrompt={`Create an ecommerce category description for ${
                title || "this category"
              }`}
            />

            {/* IMAGE */}
            <ImageInput
              name="imageUrl"
              endpoint="categoryImageUploader"
              label="Category Image"
            />

            {/* LOCALE */}
            <select
              {...form.register("locale")}
              className="border bg-background text-foreground shadow-xs w-full px-4 py-2"
            >
              <option value="EN">English</option>
              <option value="HI">Hindi</option>
              <option value="MR">Marathi</option>
            </select>

            {/* STATUS */}
            <ToggleInput
              label="Status"
              name="isActive"
              trueTitle="Active"
              falseTitle="Draft"
            />

            {/* SUBMIT */}
            <SubmitButton
              isLoading={isLoading}
              buttonTitle={
                id ? "Update Category" : "Create Category"
              }
              loadingButtonTitle={
                id ? "Updating..." : "Creating..."
              }
            />
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
