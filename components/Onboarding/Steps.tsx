"use client";

import React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import BasicInformationForm from "./StepForms/BasicInformationForm";
import FarmDetailsForm from "./StepForms/FarmDetailsForm";
import AdditionalInformationForm from "./StepForms/AdditionalInformationForm";
import Summary from "./StepForms/Summary";

interface Props {
  sellerId: string;
}

export default function StepForm({ sellerId }: Props) {
  const currentStep = useSelector(
    (store: RootState) => store.onboarding.currentStep
  );

  function renderFormByStep(step: number) {
    switch (step) {
      case 1:
        return <BasicInformationForm />;
      case 2:
        return <FarmDetailsForm />;
      case 3:
        return <AdditionalInformationForm />;
      case 4:
        return <Summary sellerId={sellerId} />;
      default:
        return null;
    }
  }

  return <div>{renderFormByStep(currentStep)}</div>;
}
