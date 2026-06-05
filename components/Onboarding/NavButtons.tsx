"use client";

import { setCurrentStep } from "@/redux/slices/onboardingSlice";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

export default function NavButtons() {
  const currentStep = useSelector(
    (store: RootState) => store.onboarding.currentStep
  );

  const dispatch = useDispatch();

  function handlePrevious() {
    dispatch(setCurrentStep(currentStep - 1));
  }

  return (
    <div className="flex justify-between items-center">
      {currentStep > 1 && (
        <button
          type="button"
          onClick={handlePrevious}
          className="btn"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Previous
        </button>
      )}

      <button type="submit" className="btn">
        Next
        <ChevronRight className="w-5 h-5 ml-2" />
      </button>
    </div>
  );
}
