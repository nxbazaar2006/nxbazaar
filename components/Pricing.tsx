import React from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { formatINR } from "@/lib/currency";

type Plan = {
  title: string;
  description: string;
  price: string;
  isRecommended?: boolean;
  features: string[];
  nonFeatures?: string[];
  link: string;
  buttonText: string;
  backgroundColor?: string;
};

export default function Pricing() {
  const plans: Plan[] = [
    {
      title: "Free",
      isRecommended: false,
      description: "+5% transaction fee. Its Good For Starters",
      price: formatINR(0),
      features: ["All features", "Unlimited products", "Unlimited revenue"],
      nonFeatures: [],
      link: "/register-seller?plan=free",
      buttonText: "Start for free",
      backgroundColor: "bg-slate-200",
    },
    {
      title: "Silver",
      isRecommended: true,
      description:
        "+2% transaction fee. Its Good if your revenue is above ₹500",
      price: formatINR(20),
      features: ["All features", "Unlimited products", "Unlimited revenue"],
      nonFeatures: [],
      link: "/register-seller?plan=silver",
      buttonText: "Get started",
      backgroundColor: "bg-slate-200",
    },
    {
      title: "Gold",
      isRecommended: false,
      description:
        "No transaction fee. Is Good if your earning more than ₹5000 in revenue",
      price: formatINR(99),
      features: ["All features", "Unlimited products", "Unlimited revenue"],
      nonFeatures: [],
      link: "/register-seller?plan=gold",
      buttonText: "Get Started",
      backgroundColor: "bg-slate-200",
    },
  ];

  return (
    <div className="sm:flex sm:flex-col sm:align-center p-2 md:p-10">
      
      {/* Heading */}
      <div className="flex flex-col items-center">
        <div className="relative bg-slate-200 dark:bg-slate-900 rounded-2xl p-1">
          <span className="rounded-2xl py-2 text-sm font-medium px-4 sm:px-8 bg-slate-50 text-slate-900 shadow-sm">
            Choose a plan which suits you!
          </span>
        </div>

        <p className="max-w-2xl text-center mt-4 text-slate-600 dark:text-slate-300">
          Discover simplicity in pricing with us. Our straightforward and
          competitive rates ensure you get the best value. No hidden fees,
          just transparent options to meet your needs.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="mt-12 sm:mt-16 grid gap-6 sm:grid-cols-3 md:max-w-5xl md:mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.title}
            className="border border-slate-200 rounded-2xl shadow-sm divide-y"
          >
            {/* Plan Header */}
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {plan.title}
                </h2>

                {plan.isRecommended && (
                  <span className="uppercase bg-lime-500 text-white text-xs rounded-full px-3 py-1">
                    recommended
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {plan.description}
              </p>

              <p className="mt-8">
                <span className="text-4xl font-bold text-slate-900 dark:text-lime-400">
                  {plan.price}
                </span>
                <span className="text-sm text-slate-500"> /mo</span>
              </p>
            </div>

            {/* Features */}
            <div className="pt-6 pb-8 px-6">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">
                What's included
              </h3>

              <ul className="mt-4 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {feature}
                    </span>
                  </li>
                ))}

                {plan.nonFeatures?.map((feature) => (
                  <li key={feature} className="flex items-center space-x-3">
                    <X className="h-5 w-5 text-red-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.link}
                className="mt-8 block w-full bg-slate-950 dark:bg-lime-500 rounded-full py-3 text-sm font-semibold text-white text-center"
              >
                {plan.buttonText}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
