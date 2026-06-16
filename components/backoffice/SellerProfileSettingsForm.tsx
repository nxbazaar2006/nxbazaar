"use client";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver } from "react-hook-form";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import type { z } from "zod";

import { updateSellerProfileSettings } from "@/actions/Seller";
import TextInput from "@/components/FormInputs/TextInput";
import SubmitButton from "@/components/FormInputs/SubmitButton";
import ToggleInput from "@/components/FormInputs/ToggleInput";
import { SellerSchema } from "@/lib/validators/seller.schema";

type SellerProfileFormInput = z.input<typeof SellerSchema>;

type Props = {
  user: {
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
};

export default function SellerProfileSettingsForm({ user }: Props) {
  const router = useRouter();
  const profile = user.sellerProfile;

  const form = useForm<SellerProfileFormInput>({
    resolver: zodResolver(SellerSchema) as unknown as Resolver<SellerProfileFormInput>,
    defaultValues: {
      userId: user.id,
      name: user.name ?? "",
      email: user.email ?? "",
      code: profile?.code ?? "",
      businessName: profile?.businessName ?? "",
      legalName: profile?.legalName ?? "",
      businessType: profile?.businessType ?? "",
      gstNumber: profile?.gstNumber ?? "",
      panNumber: profile?.panNumber ?? "",
      mainProduct: profile?.mainProduct ?? "",
      contactPerson: profile?.contactPerson ?? "",
      contactPersonPhone: profile?.contactPersonPhone ?? "",
      phone: profile?.phone ?? "",
      turnover:
        profile?.turnover === undefined || profile?.turnover === null
          ? ""
          : String(profile.turnover),
      physicalAddress: profile?.physicalAddress ?? "",
      pickupAddress: profile?.pickupAddress ?? "",
      city: profile?.city ?? "",
      state: profile?.state ?? "",
      country: profile?.country ?? "India",
      zip: profile?.zip ?? "",
      bankName: profile?.bankName ?? "",
      bankAccountName: profile?.bankAccountName ?? "",
      bankAccountNumber: profile?.bankAccountNumber ?? "",
      bankIfscCode: profile?.bankIfscCode ?? "",
      profileImageUrl: profile?.profileImageUrl ?? "",
      notes: profile?.notes ?? "",
      isActive: profile?.isActive ?? true,
    },
  });

  async function onSubmit(data: SellerProfileFormInput) {
    const response = await updateSellerProfileSettings(data);

    if (!response.success) {
      toast.error(response.error ?? "Seller profile update failed");
      return;
    }

    toast.success("Seller profile updated");
    router.refresh();
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="rounded-2xl border border-white/50 p-5 backdrop-blur-xl dark:border-white/10"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput<SellerProfileFormInput> label="Seller Name" name="name" register={form.register} errors={form.formState.errors} required />
          <TextInput<SellerProfileFormInput> label="Email" name="email" type="email" register={form.register} errors={form.formState.errors} required />
          <TextInput<SellerProfileFormInput> label="Seller Code" name="code" register={form.register} errors={form.formState.errors} />
          <TextInput<SellerProfileFormInput> label="Business Name" name="businessName" register={form.register} errors={form.formState.errors} />
          <TextInput<SellerProfileFormInput> label="Legal Name" name="legalName" register={form.register} errors={form.formState.errors} />
          <TextInput<SellerProfileFormInput> label="Business Type" name="businessType" register={form.register} errors={form.formState.errors} />
          <TextInput<SellerProfileFormInput> label="GST Number" name="gstNumber" register={form.register} errors={form.formState.errors} />
          <TextInput<SellerProfileFormInput> label="PAN Number" name="panNumber" register={form.register} errors={form.formState.errors} />
          <TextInput<SellerProfileFormInput> label="Main Product" name="mainProduct" register={form.register} errors={form.formState.errors} />
          <TextInput<SellerProfileFormInput> label="Contact Person" name="contactPerson" register={form.register} errors={form.formState.errors} required />
          <TextInput<SellerProfileFormInput> label="Contact Person Phone" name="contactPersonPhone" register={form.register} errors={form.formState.errors} required />
          <TextInput<SellerProfileFormInput> label="Phone" name="phone" register={form.register} errors={form.formState.errors} required />
          <TextInput<SellerProfileFormInput> label="Turnover" name="turnover" type="number" register={form.register} errors={form.formState.errors} required />
          <TextInput<SellerProfileFormInput> label="Profile Image URL" name="profileImageUrl" register={form.register} errors={form.formState.errors} />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <TextInput<SellerProfileFormInput> label="Physical Address" name="physicalAddress" register={form.register} errors={form.formState.errors} required />
          <TextInput<SellerProfileFormInput> label="Pickup Address" name="pickupAddress" register={form.register} errors={form.formState.errors} />
          <TextInput<SellerProfileFormInput> label="City" name="city" register={form.register} errors={form.formState.errors} />
          <TextInput<SellerProfileFormInput> label="State" name="state" register={form.register} errors={form.formState.errors} />
          <TextInput<SellerProfileFormInput> label="Country" name="country" register={form.register} errors={form.formState.errors} />
          <TextInput<SellerProfileFormInput> label="ZIP" name="zip" register={form.register} errors={form.formState.errors} />
          <TextInput<SellerProfileFormInput> label="Bank Name" name="bankName" register={form.register} errors={form.formState.errors} />
          <TextInput<SellerProfileFormInput> label="Bank Account Name" name="bankAccountName" register={form.register} errors={form.formState.errors} />
          <TextInput<SellerProfileFormInput> label="Bank Account Number" name="bankAccountNumber" register={form.register} errors={form.formState.errors} />
          <TextInput<SellerProfileFormInput> label="Bank IFSC Code" name="bankIfscCode" register={form.register} errors={form.formState.errors} />
        </div>

        <div className="mt-4">
          <TextInput<SellerProfileFormInput> label="Notes" name="notes" register={form.register} errors={form.formState.errors} />
        </div>

        <div className="mt-5">
          <ToggleInput<SellerProfileFormInput>
            label="Seller Status"
            name="isActive"
            trueTitle="Active"
            falseTitle="Inactive"
          />
        </div>

        <div className="mt-6">
          <SubmitButton
            buttonTitle="Update Seller Profile"
            loadingButtonTitle="Updating..."
            isLoading={form.formState.isSubmitting}
          />
        </div>
      </form>
    </FormProvider>
  );
}
