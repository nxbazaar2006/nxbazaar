"use client";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver } from "react-hook-form";
import toast from "react-hot-toast";
import type { z } from "zod";

import ImageInput from "@/components/FormInputs/ImageInput";
import SubmitButton from "@/components/FormInputs/SubmitButton";
import TextInput from "@/components/FormInputs/TextInput";
import ToggleInput from "@/components/FormInputs/ToggleInput";
import { createSeller, updateSeller } from "@/actions/Seller";
import { SellerSchema, type SellerInput } from "@/lib/validators/seller.schema";

type SellerFormInput = z.input<typeof SellerSchema>;

type SellerUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  sellerProfile?: {
    code?: string | null;
    contactPerson?: string | null;
    contactPersonPhone?: string | null;
    phone?: string | null;
    physicalAddress?: string | null;
    profileImageUrl?: string | null;
    notes?: string | null;
    isActive?: boolean | null;
    turnover?: number | null;
    mainProduct?: string | null;
  } | null;
};

type Props = {
  user?: SellerUser;
  isEdit?: boolean;
};

function defaultValues(user?: SellerUser): SellerFormInput {
  const profile = user?.sellerProfile;

  return {
    userId: user?.id,
    name: user?.name ?? "",
    email: user?.email ?? "",
    code: profile?.code ?? "",
    contactPerson: profile?.contactPerson ?? "",
    contactPersonPhone: profile?.contactPersonPhone ?? "",
    phone: profile?.phone ?? "",
    physicalAddress: profile?.physicalAddress ?? "",
    profileImageUrl: profile?.profileImageUrl ?? "",
    notes: profile?.notes ?? "",
    isActive: profile?.isActive ?? true,
    turnover:
      profile?.turnover === undefined || profile?.turnover === null
        ? ""
        : String(profile.turnover),
    mainProduct: profile?.mainProduct ?? "",
  };
}

export default function NewSellerForm({ user, isEdit = false }: Props) {
  const form = useForm<SellerFormInput>({
    resolver: zodResolver(SellerSchema) as unknown as Resolver<SellerFormInput>,
    defaultValues: defaultValues(user),
  });

  async function onSubmit(data: SellerFormInput) {
    const response =
      isEdit && user?.id
        ? await updateSeller(user.id, data)
        : await createSeller(data);

    if (!response.success) {
      toast.error(response.error ?? "Seller save failed");
      return;
    }

    toast.success(isEdit ? "Seller updated" : "Seller created");
    window.location.assign("/dashboard/sellers");
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto max-w-5xl space-y-6 rounded-lg border border-white/10 bg-white/5 p-6"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput<SellerFormInput>
            label="Seller Name"
            name="name"
            register={form.register}
            errors={form.formState.errors}
          />
          <TextInput<SellerFormInput>
            label="Email"
            name="email"
            type="email"
            register={form.register}
            errors={form.formState.errors}
          />
          <TextInput<SellerFormInput>
            label="Seller Code"
            name="code"
            register={form.register}
            errors={form.formState.errors}
          />
          <TextInput<SellerFormInput>
            label="Main Product"
            name="mainProduct"
            register={form.register}
            errors={form.formState.errors}
          />
          <TextInput<SellerFormInput>
            label="Contact Person"
            name="contactPerson"
            register={form.register}
            errors={form.formState.errors}
          />
          <TextInput<SellerFormInput>
            label="Contact Person Phone"
            name="contactPersonPhone"
            register={form.register}
            errors={form.formState.errors}
          />
          <TextInput<SellerFormInput>
            label="Phone"
            name="phone"
            register={form.register}
            errors={form.formState.errors}
          />
          <TextInput<SellerFormInput>
            label="Turnover"
            name="turnover"
            type="number"
            register={form.register}
            errors={form.formState.errors}
          />
        </div>

        <TextInput<SellerFormInput>
          label="Physical Address"
          name="physicalAddress"
          register={form.register}
          errors={form.formState.errors}
        />

        <TextInput<SellerFormInput>
          label="Notes"
          name="notes"
          register={form.register}
          errors={form.formState.errors}
        />

        <ImageInput<SellerFormInput>
          name="profileImageUrl"
          endpoint="sellerProfileUploader"
          label="Seller Profile Image"
        />

        <ToggleInput<SellerFormInput>
          label="Status"
          name="isActive"
          trueTitle="Active"
          falseTitle="Inactive"
        />

        <SubmitButton
          buttonTitle={isEdit ? "Update Seller" : "Create Seller"}
          loadingButtonTitle={isEdit ? "Updating..." : "Creating..."}
          isLoading={form.formState.isSubmitting}
        />
      </form>
    </FormProvider>
  );
}
