"use client";

import GlassCard from "@/components/GlassCard";
import FormHeader from "@/components/backoffice/FormHeader";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CategoryInput } from "@/lib/validators/category.schema";
import { useToast } from "@/components/ui/use-toast";
import {
  useCreateCategory,
  useUpdateCategory,
} from "@/hooks/useCategory";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";


import TextInput from "@/components/FormInputs/TextInput";
import TextareaInput from "@/components/FormInputs/TextAreaInput";
import ToggleInput from "@/components/FormInputs/ToggleInput";
import ImageInput from "@/components/FormInputs/ImageInput";

type Props = {
  initialData?: Partial<CategoryInput> & {
    id?: string;
  };
};

const CategoryFormSchema = z.object({
  slug: z.string().trim().min(2, "Slug must be at least 2 characters"),
  title: z.string().trim().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  imageUrl: z.string().url("Image URL must be a valid URL").optional().or(z.literal("")),
  isActive: z.boolean(),
  locale: z.enum(["EN", "HI"]),
});

type CategoryFormValues = z.infer<typeof CategoryFormSchema>;

export default function CategoryForm({ initialData }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient(); 
  const { toast } = useToast(); 

  const id = initialData?.id;

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory(id ?? "");

  const [imageUrl, setImageUrl] = useState<string>(
    initialData?.imageUrl ?? ""
  );

  const {
  register,
  handleSubmit,
  control, // ✅ यही use करो
  formState: { errors },
} = useForm<CategoryFormValues>({
  resolver: zodResolver(CategoryFormSchema),
  defaultValues: {
    slug: initialData?.slug ?? "",
    title: initialData?.translations?.[0]?.title ?? "",
    description: initialData?.translations?.[0]?.description ?? "",
    imageUrl: initialData?.imageUrl ?? "",
    isActive: initialData?.isActive ?? true,
    locale: initialData?.translations?.[0]?.locale ?? "EN",
  },
});
  const onSubmit = async (data: CategoryFormValues) => {
    const payload: CategoryInput = {
      slug: data.slug,
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

      
      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });

      // optional delay (better UX)
      setTimeout(() => {
        router.push("/dashboard/categories");
      }, 500);

    } catch (error) {
      console.error("SUBMIT ERROR:", error);

      // ❌ ERROR MESSAGE
      toast({
        title: "Error ❌",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const isLoading =
    createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 space-y-6">
      <FormHeader
        title={id ? "Update Category" : "Create Category"}
      />

      <GlassCard className="max-w-7xl mx-auto space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          <TextInput
            label="Slug"
            name="slug"
            register={register}
            errors={errors}
          />

          <TextInput
            label="Category Title"
            name="title"
            register={register}
            errors={errors}
          />

          <TextareaInput<CategoryFormValues>
            label="Description"
            name="description"
            register={register}
            errors={errors}
          />

          <ImageInput<CategoryFormValues>
            name="imageUrl"
            control={control}
            endpoint="categoryImageUploader"
            label="Category Image"
          />

          <select
            {...register("locale")}
            className="w-full p-2 rounded-lg bg-white/20 border border-white/30 text-white"
          >
            <option value="EN">English</option>
            <option value="HI">Hindi</option>
          </select>

          <ToggleInput
            label="Status"
            name="isActive"
            register={register}
            trueTitle="Active"
            falseTitle="Draft"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 rounded-lg bg-white/20 hover:bg-white/30 border border-white/30 text-white transition"
          >
            {isLoading
              ? id
                ? "Updating..."
                : "Creating..."
              : id
              ? "Update Category"
              : "Create Category"}
          </button>
        </form>
      </GlassCard>
    </div>
  );
}