"use client";

import TextInput from "@/components/FormInputs/TextInput";
import React from "react";
import { useForm } from "react-hook-form";
import NavButtons from "../NavButtons";
import { useDispatch, useSelector } from "react-redux";
import { zodResolver } from "@hookform/resolvers/zod";
import { sellerBasicSchema } from "@/lib/validators/seller.schema.ts";
import { setCurrentStep, updateOnboardingFormData } from "@/redux/slices/onboardingSlice";
import { z } from "zod";
import type { RootState } from "@/redux/store";

type FormData = z.infer<typeof sellerBasicSchema>;

export default function BasicInformationForm() {
  const dispatch = useDispatch();

  const currentStep = useSelector(
    (store: RootState) => store.onboarding.currentStep
  );

  const existingFormData = useSelector(
    (store: RootState) => store.onboarding.onboardingFormData
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(sellerBasicSchema),
    defaultValues: existingFormData,
  });

  function processData(data: FormData) {
    dispatch(updateOnboardingFormData(data));
    dispatch(setCurrentStep(currentStep + 1));
  }

  return (
    <form onSubmit={handleSubmit(processData)}>
      <h2 className="text-xl font-semibold mb-4">
        Seller Basic Information
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">

        <TextInput
          label="First Name"
          name="firstName"
          register={register}
          errors={errors}
        />

        <TextInput
          label="Last Name"
          name="lastName"
          register={register}
          errors={errors}
        />

        <TextInput
          label="Phone"
          name="phone"
          register={register}
          errors={errors}
        />

        <TextInput
          label="Address"
          name="physicalAddress"
          register={register}
          errors={errors}
        />

        <TextInput
          label="Contact Person"
          name="contactPerson"
          register={register}
          errors={errors}
        />

        <TextInput
          label="Contact Person Phone"
          name="contactPersonPhone"
          register={register}
          errors={errors}
        />

      </div>

      <NavButtons />
    </form>
  );
}
