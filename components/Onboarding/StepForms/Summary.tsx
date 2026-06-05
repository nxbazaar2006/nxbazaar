"use client";

import api from "@/lib/axios";
import { setCurrentStep } from "@/redux/slices/onboardingSlice";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import type { RootState } from "@/redux/store";

interface Props {
  sellerId: string;
}

export default function Summary({ sellerId }: Props) {

  const dispatch = useDispatch();

  const onboardingFormData = useSelector(
    (store: RootState) => store.onboarding.onboardingFormData
  );

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/sellers", {
        ...onboardingFormData,
        userId: sellerId,
      });

      return data;
    },
  });

  function handlePrevious() {
    dispatch(setCurrentStep(3));
  }

  return (
    <div className="my-6">

      <h2 className="text-xl font-semibold mb-4">
        Seller Summary
      </h2>

      <button
        onClick={handlePrevious}
        className="btn"
      >
        <ChevronLeft />
        Previous
      </button>

      <button
        onClick={() => mutation.mutate()}
        className="btn"
      >
        Submit
        <ChevronRight />
      </button>

    </div>
  );
}
