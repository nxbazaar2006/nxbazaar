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
    businessName?: string | null;
    legalName?: string | null;
    businessType?: string | null;
    gstNumber?: string | null;
    panNumber?: string | null;
    contactPerson?: string | null;
    contactPersonPhone?: string | null;
    phone?: string | null;
    physicalAddress?: string | null;
    pickupAddress?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    zip?: string | null;
    bankAccountName?: string | null;
    bankAccountNumber?: string | null;
    bankIfscCode?: string | null;
    bankName?: string | null;
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
    businessName: profile?.businessName ?? "",
    legalName: profile?.legalName ?? "",
    businessType: profile?.businessType ?? "",
    gstNumber: profile?.gstNumber ?? "",
    panNumber: profile?.panNumber ?? "",
    contactPerson: profile?.contactPerson ?? "",
    contactPersonPhone: profile?.contactPersonPhone ?? "",
    phone: profile?.phone ?? "",
    physicalAddress: profile?.physicalAddress ?? "",
    pickupAddress: profile?.pickupAddress ?? "",
    city: profile?.city ?? "",
    state: profile?.state ?? "",
    country: profile?.country ?? "India",
    zip: profile?.zip ?? "",
    bankAccountName: profile?.bankAccountName ?? "",
    bankAccountNumber: profile?.bankAccountNumber ?? "",
    bankIfscCode: profile?.bankIfscCode ?? "",
    bankName: profile?.bankName ?? "",
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
  const shouldUpdate = isEdit || Boolean(user?.sellerProfile);

  const form = useForm<SellerFormInput>({
    resolver: zodResolver(SellerSchema) as unknown as Resolver<SellerFormInput>,
    defaultValues: defaultValues(user),
  });

  async function onSubmit(data: SellerFormInput) {
    const response =
      shouldUpdate && user?.id
        ? await updateSeller(user.id, data)
        : await createSeller(data);

    if (!response.success) {
      toast.error(response.error ?? "Seller save failed");
      return;
    }

    toast.success(shouldUpdate ? "Seller updated" : "Seller created");
    window.location.assign("/dashboard/sellers");
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto max-w-5xl space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6"
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
            label="Business Name"
            name="businessName"
            register={form.register}
            errors={form.formState.errors}
          />
          <TextInput<SellerFormInput>
            label="Legal Name"
            name="legalName"
            register={form.register}
            errors={form.formState.errors}
          />
          <TextInput<SellerFormInput>
            label="Business Type"
            name="businessType"
            register={form.register}
            errors={form.formState.errors}
          />
          <TextInput<SellerFormInput>
            label="GST Number"
            name="gstNumber"
            register={form.register}
            errors={form.formState.errors}
          />
          <TextInput<SellerFormInput>
            label="PAN Number"
            name="panNumber"
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

        <div className="grid gap-4 md:grid-cols-2">
          <TextInput<SellerFormInput>
            label="Pickup Address"
            name="pickupAddress"
            register={form.register}
            errors={form.formState.errors}
          />
          <TextInput<SellerFormInput>
            label="City"
            name="city"
            register={form.register}
            errors={form.formState.errors}
          />
          <TextInput<SellerFormInput>
            label="State"
            name="state"
            register={form.register}
            errors={form.formState.errors}
          />
          <TextInput<SellerFormInput>
            label="Country"
            name="country"
            register={form.register}
            errors={form.formState.errors}
          />
          <TextInput<SellerFormInput>
            label="ZIP"
            name="zip"
            register={form.register}
            errors={form.formState.errors}
          />
          <TextInput<SellerFormInput>
            label="Bank Name"
            name="bankName"
            register={form.register}
            errors={form.formState.errors}
          />
          <TextInput<SellerFormInput>
            label="Bank Account Name"
            name="bankAccountName"
            register={form.register}
            errors={form.formState.errors}
          />
          <TextInput<SellerFormInput>
            label="Bank Account Number"
            name="bankAccountNumber"
            register={form.register}
            errors={form.formState.errors}
          />
          <TextInput<SellerFormInput>
            label="Bank IFSC Code"
            name="bankIfscCode"
            register={form.register}
            errors={form.formState.errors}
          />
        </div>

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
          buttonTitle={shouldUpdate ? "Update Seller" : "Create Seller"}
          loadingButtonTitle={shouldUpdate ? "Updating..." : "Creating..."}
          isLoading={form.formState.isSubmitting}
        />
      </form>
    </FormProvider>
  );
}
