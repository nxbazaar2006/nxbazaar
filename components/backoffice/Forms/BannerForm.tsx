"use client"

import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

import GlassCard from "@/components/GlassCard"
import ImageInput from "@/components/FormInputs/ImageInput"
import SubmitButton from "@/components/FormInputs/SubmitButton"
import TextInput from "@/components/FormInputs/TextInput"
import ToggleInput from "@/components/FormInputs/ToggleInput"
import { getErrorMessage } from "@/lib/error-message"

import { bannerSchema, BannerInput } from "@/lib/validators/banner.schema"
import { useCreateBanner, useUpdateBanner } from "@/hooks/useBannerMutation"

interface BannerFormProps {
  updateData?: Partial<BannerInput & { id: string }>
}

export default function BannerForm({ updateData }: BannerFormProps) {

  const router = useRouter()

  const createMutation = useCreateBanner()
  const updateMutation = useUpdateBanner()

  const form = useForm<BannerInput>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: updateData?.title || "",
      link: updateData?.link || "",
      imageUrl: updateData?.imageUrl || "",
      isActive: updateData?.isActive ?? true,
    },
  })

  const onSubmit = async (data: BannerInput) => {
    if (!data.imageUrl) {
      toast.error("Banner image is required")
      return
    }

    try {

      if (updateData?.id) {

        const result = await updateMutation.mutateAsync({
          id: updateData.id,
          ...data,
        })

        if (result.success) {
          toast.success("Banner updated successfully")
          router.push("/dashboard/banners")
        } else {
          toast.error(result.error ?? "Failed to update banner")
        }

      } else {

        const result = await createMutation.mutateAsync(data)

        if (result.success) {
          toast.success("Banner created successfully")
          form.reset()
          router.push("/dashboard/banners")
        } else {
          toast.error(result.error ?? "Failed to create banner")
        }

      }

    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Something went wrong"))
    }
  }

  const isLoading =
    form.formState.isSubmitting ||
    createMutation.isPending ||
    updateMutation.isPending

  return (
    <GlassCard className="mx-auto max-w-4xl">
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">

            <TextInput<BannerInput>
              label="Banner Title"
              name="title"
            />

            <TextInput<BannerInput>
              label="Banner Link"
              name="link"
              type="url"
            />

            <div className="sm:col-span-2">
              <ImageInput<BannerInput>
                label="Banner Image"
                name="imageUrl"
                endpoint="bannerImageUploader"
              />
            </div>

            <ToggleInput<BannerInput>
              label="Publish your Banner"
              name="isActive"
              trueTitle="Active"
              falseTitle="Draft"
            />

          </div>

          <SubmitButton
            isLoading={isLoading}
            buttonTitle={updateData?.id ? "Update Banner" : "Create Banner"}
            loadingButtonTitle={`${updateData?.id ? "Updating" : "Creating"} Banner please wait...`}
          />

        </form>
      </FormProvider>
    </GlassCard>
  )
}
