"use client"

import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import TextInput from "@/components/FormInputs/TextInput"
import ToggleInput from "@/components/FormInputs/ToggleInput"
import SubmitButton from "@/components/FormInputs/SubmitButton"
import { couponSchema } from "@/lib/validators/coupon.schema"
import { useCreateCoupon, useUpdateCoupon } from "@/hooks/useCouponMutation"
import type { CreateCouponInput, UpdateCouponInput } from "@/types/coupon"
import { getErrorMessage } from "@/lib/error-message"

interface CouponFormProps {
  updateData?: UpdateCouponInput
  vendorId: string
}

export default function CouponForm({ updateData, vendorId }: CouponFormProps) {
  const router = useRouter()

  const createMutation = useCreateCoupon()
  const updateMutation = useUpdateCoupon()

  const form = useForm<CreateCouponInput>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      title: updateData?.title || "",
      expiryDate: updateData?.expiryDate 
        ? typeof updateData.expiryDate === 'string' 
          ? updateData.expiryDate.split('T')[0]
          : new Date(updateData.expiryDate).toISOString().split('T')[0]
        : "",
      isActive: updateData?.isActive ?? true,
      vendorId: updateData?.vendorId || vendorId,
    },
  })

  const onSubmit = async (data: CreateCouponInput) => {
    try {
      if (updateData?.id) {
        const result = await updateMutation.mutateAsync({
          id: updateData.id,
          ...data,
          vendorId: vendorId || data.vendorId,
        })

        if (result.success) {
          toast.success("Coupon updated successfully")
          router.push("/dashboard/coupons")
        } else {
          toast.error(result.error || "Failed to update coupon")
        }
      } else {
        const result = await createMutation.mutateAsync({
          ...data,
          vendorId: vendorId || data.vendorId,
        })

        if (result.success) {
          toast.success("Coupon created successfully")
          form.reset()
          router.push("/dashboard/coupons")
          router.refresh()
        } else {
          toast.error(result.error || "Failed to create coupon")
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
    <div className="border bg-card text-card-foreground shadow-sm mx-auto max-w-4xl rounded-2xl p-4">
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            <input type="hidden" {...form.register("vendorId")} />

            <TextInput<CreateCouponInput>
              label="Coupon Title"
              name="title"
              className="w-full"
            />

            <TextInput<CreateCouponInput>
              label="Coupon Expiry Date"
              name="expiryDate"
              type="date"
              className="w-full"
            />

            <ToggleInput<CreateCouponInput>
              label="Publish your Coupon"
              name="isActive"
              trueTitle="Active"
              falseTitle="Draft"
            />
          </div>

          <SubmitButton
            isLoading={isLoading}
            buttonTitle={updateData?.id ? "Update Coupon" : "Create Coupon"}
            loadingButtonTitle={`${
              updateData?.id ? "Updating" : "Creating"
            } Coupon please wait...`}
          />
        </form>
      </FormProvider>
    </div>
  )
}
