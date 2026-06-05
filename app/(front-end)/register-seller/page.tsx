"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import RegisterForm from "@/components/frontend/RegisterForm";

export default function Page() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") ?? "";

  return (
    <section>
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="glass-card w-full md:mt-0 sm:max-w-md xl:p-0">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-foreground md:text-2xl text-center">
              Create a new account
            </h1>

            <RegisterForm role="SELLER" plan={plan} />
          </div>
        </div>
      </div>
    </section>
  );
}
