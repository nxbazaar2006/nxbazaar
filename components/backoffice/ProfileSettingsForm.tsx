"use client";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver } from "react-hook-form";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { updateProfileSettings } from "@/actions/users";
import TextInput from "@/components/FormInputs/TextInput";
import SubmitButton from "@/components/FormInputs/SubmitButton";
import {
  profileSettingsSchema,
  type ProfileSettingsInput,
} from "@/lib/validators/userSchema";

type ProfileSettingsFormInput = ProfileSettingsInput;

type Props = {
  user: {
    name?: string | null;
    email?: string | null;
    profile?: {
      firstName?: string | null;
      lastName?: string | null;
      username?: string | null;
      phone?: string | null;
      streetAddress?: string | null;
      city?: string | null;
      district?: string | null;
      state?: string | null;
      country?: string | null;
      zip?: string | null;
      dateOfBirth?: Date | string | null;
      profileImage?: string | null;
    } | null;
  };
};

function formatDateInput(value?: Date | string | null) {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
}

export default function ProfileSettingsForm({ user }: Props) {
  const router = useRouter();
  const profile = user.profile;

  const form = useForm<ProfileSettingsFormInput>({
    resolver: zodResolver(profileSettingsSchema) as unknown as Resolver<ProfileSettingsFormInput>,
    defaultValues: {
      name: user.name ?? "",
      email: user.email ?? "",
      firstName: profile?.firstName ?? "",
      lastName: profile?.lastName ?? "",
      username: profile?.username ?? "",
      phone: profile?.phone ?? "",
      streetAddress: profile?.streetAddress ?? "",
      city: profile?.city ?? "",
      district: profile?.district ?? "",
      state: profile?.state ?? "",
      country: profile?.country ?? "India",
      zip: profile?.zip ?? "",
      dateOfBirth: formatDateInput(profile?.dateOfBirth),
      profileImage: profile?.profileImage ?? "",
    },
  });

  async function onSubmit(data: ProfileSettingsFormInput) {
    const response = await updateProfileSettings(data);

    if (!response.success) {
      toast.error(response.error ?? "Profile update failed");
      return;
    }

    toast.success("Profile updated");
    router.refresh();
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="rounded-2xl border border-white/50 p-5 backdrop-blur-xl dark:border-white/10"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput<ProfileSettingsFormInput>
            label="Name"
            name="name"
            register={form.register}
            errors={form.formState.errors}
            required
          />
          <TextInput<ProfileSettingsFormInput>
            label="Email"
            name="email"
            type="email"
            register={form.register}
            errors={form.formState.errors}
            required
          />
          <TextInput<ProfileSettingsFormInput>
            label="First Name"
            name="firstName"
            register={form.register}
            errors={form.formState.errors}
          />
          <TextInput<ProfileSettingsFormInput>
            label="Last Name"
            name="lastName"
            register={form.register}
            errors={form.formState.errors}
          />
          <TextInput<ProfileSettingsFormInput>
            label="Username"
            name="username"
            register={form.register}
            errors={form.formState.errors}
          />
          <TextInput<ProfileSettingsFormInput>
            label="Phone"
            name="phone"
            register={form.register}
            errors={form.formState.errors}
          />
          <TextInput<ProfileSettingsFormInput>
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            register={form.register}
            errors={form.formState.errors}
          />
          <TextInput<ProfileSettingsFormInput>
            label="Profile Image URL"
            name="profileImage"
            register={form.register}
            errors={form.formState.errors}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <TextInput<ProfileSettingsFormInput>
            label="Street Address"
            name="streetAddress"
            register={form.register}
            errors={form.formState.errors}
          />
          <TextInput<ProfileSettingsFormInput>
            label="City"
            name="city"
            register={form.register}
            errors={form.formState.errors}
          />
          <TextInput<ProfileSettingsFormInput>
            label="District"
            name="district"
            register={form.register}
            errors={form.formState.errors}
          />
          <TextInput<ProfileSettingsFormInput>
            label="State"
            name="state"
            register={form.register}
            errors={form.formState.errors}
          />
          <TextInput<ProfileSettingsFormInput>
            label="Country"
            name="country"
            register={form.register}
            errors={form.formState.errors}
          />
          <TextInput<ProfileSettingsFormInput>
            label="ZIP"
            name="zip"
            register={form.register}
            errors={form.formState.errors}
          />
        </div>

        <div className="mt-6">
          <SubmitButton
            buttonTitle="Update Profile"
            loadingButtonTitle="Updating..."
            isLoading={form.formState.isSubmitting}
          />
        </div>
      </form>
    </FormProvider>
  );
}
