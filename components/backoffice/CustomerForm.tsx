"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customerSchema, CustomerInput } from "@/lib/validators/customer.schema";
import { useRouter } from "next/navigation";
import { useUpdateCustomer } from "@/hooks/useCustomers";
import ImageInput from "@/components/FormInputs/ImageInput";
import SubmitButton from "@/components/FormInputs/SubmitButton";
import TextInput from "@/components/FormInputs/TextInput";

interface Props {
  user: {
    id: string;
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
      country?: string | null;
      dateOfBirth?: Date | null;
      profileImage?: string | null;
    } | null;
  };
}

export default function CustomerForm({ user }: Props) {

  const router = useRouter();
  const [imageUrl, setImageUrl] = useState(user.profile?.profileImage ?? "");

  // React Query Mutation Hook
  const mutation = useUpdateCustomer();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: user.name ?? "",
      email: user.email ?? "",
      username: user.profile?.username ?? "",
      phone: user.profile?.phone ?? "",
      firstName: user.profile?.firstName ?? "",
      lastName: user.profile?.lastName ?? "",
      dateOfBirth: user.profile?.dateOfBirth
        ? user.profile.dateOfBirth.toISOString().slice(0, 10)
        : "",
      streetAddress: user.profile?.streetAddress ?? "",
      city: user.profile?.city ?? "",
      district: user.profile?.district ?? "",
      country: user.profile?.country ?? "",
      profileImage: user.profile?.profileImage ?? "",
    }
  });

  const onSubmit = async (data: CustomerInput) => {
    await mutation.mutateAsync({
      id: user.id,
      ...data,
      profileImage: imageUrl || data.profileImage,
    });

    router.push("/dashboard/customers");
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-4xl mx-auto p-6 rounded-lg 
bg-orange-500 dark:bg-orange-500 
border border-orange-300 dark:border-orange-900 
text-foreground"
    >

      <h2 className="text-xl font-semibold mb-6">
        Personal Details
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">

        <TextInput
          label="Full Name"
          name="name"
          register={register}
          errors={errors}
        />

        <TextInput
          label="Username"
          name="username"
          register={register}
          errors={errors}
        />

        <TextInput
          label="Email"
          name="email"
          type="email"
          register={register}
          errors={errors}
        />

        <TextInput
          label="Phone"
          name="phone"
          register={register}
          errors={errors}
        />

        <ImageInput
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          endpoint="customerProfileUploader"
          label="Profile Image"
        />

      </div>

      <h2 className="text-xl font-semibold mt-10 mb-6">
        Shipping Details
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">

        <TextInput
          label="Street Address"
          name="streetAddress"
          register={register}
          errors={errors}
        />

        <TextInput
          label="City"
          name="city"
          register={register}
          errors={errors}
        />

        <TextInput
          label="District"
          name="district"
          register={register}
          errors={errors}
        />

        <TextInput
          label="Country"
          name="country"
          register={register}
          errors={errors}
        />

      </div>

      <div className="mt-8">

        <SubmitButton
          isLoading={mutation.isPending}
          buttonTitle="Update Customer"
          loadingButtonTitle="Updating..."
        />

      </div>

    </form>
  );
}
