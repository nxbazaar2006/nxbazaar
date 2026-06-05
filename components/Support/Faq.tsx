"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

type FAQItem = {
  id: number;
  question: string;
  answer: string;
};

const faqData: FAQItem[] = [
  {
    id: 1,
    question: "How to place an order with Limi Commerce",
    answer:
      "To place an order on Limi Commerce Step 1: Browse and select the desired product(s)...",
  },
  {
    id: 2,
    question: "What payment methods are accepted?",
    answer:
      "Limi Commerce offers multiple payment options including Pay on Delivery...",
  },
  // बाकी same data रख सकते हो
];

export default function Faq() {
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

  const handleAccordionClick = (id: number) => {
    setActiveAccordion((prev) => (prev === id ? null : id));
  };

  return (
    <div className="bg-primaryColor dark:bg-white">
      <div className="h-full px-4 py-[8rem] mx-auto md:px-12 max-w-7xl">
        <div className="grid grid-cols-1 gap-6 lg:gap-12 lg:grid-cols-3">
          
          {/* LEFT SIDE */}
          <div className="text-center lg:text-left">
            <p className="text-4xl font-semibold tracking-tighter dark:text-black text-white">
              Frequently asked questions and answers
            </p>
            <p className="text-base mt-4 dark:text-zinc-900 text-zinc-300">
              Answers to commonly asked questions about our services and packages
            </p>
          </div>

          {/* RIGHT SIDE */}
          <div className="relative w-full mx-auto font-normal lg:col-span-2">
            {faqData.map((faqItem) => {
              const isOpen = activeAccordion === faqItem.id;

              return (
                <div
                  key={faqItem.id}
                  className="cursor-pointer group text-slate-50 dark:text-black"
                >
                  <button
                    className="flex items-center justify-between w-full p-4 pb-1 text-sm text-left lg:text-base"
                    onClick={() => handleAccordionClick(faqItem.id)}
                    aria-expanded={isOpen}
                  >
                    <span className="font-semibold">
                      {faqItem.question}
                    </span>

                    {isOpen ? (
                      <Minus className="w-5 h-5 transition" />
                    ) : (
                      <Plus className="w-5 h-5 transition" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="p-4 pt-2 text-lg text-gray-300 dark:text-zinc-900">
                      {faqItem.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
