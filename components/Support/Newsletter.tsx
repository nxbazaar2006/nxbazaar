"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MoveRight } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState<string>("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) return;

    console.log("Subscribed Email:", email);

    // 👉 यहाँ API call कर सकते हो
    // await fetch("/api/newsletter", { method: "POST", body: JSON.stringify({ email }) })

    setEmail("");
  };

  return (
    <div className="flex bg-white dark:bg-primaryColor items-center w-full px-5 py-12 mx-auto md:px-12 lg:px-16">
      <div className="max-w-3xl mx-auto text-center lg:p-10">

        {/* TEXT */}
        <div>
          <p className="text-5xl tracking-tight text-black dark:text-white">
            Subscribe and get
            <span className="lg:block">
              benefits from our newsletter
            </span>
          </p>

          <p className="mt-4 text-lg tracking-tight text-gray-600 dark:text-gray-300">
            Stay updated with latest offers, products and news.
          </p>
        </div>

        {/* FORM */}
        <div className="flex flex-col items-center max-w-sm pt-8 pb-12 mx-auto md:pt-6">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center justify-center w-full"
          >
            <div className="flex flex-col w-full gap-2 mt-3 sm:flex-row">
              
              <input
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email..."
                className="block w-full px-4 py-2 text-sm font-medium text-gray-800 placeholder-gray-400 bg-white border border-gray-300 rounded-md focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              />

              <button
                type="submit"
                className="inline-flex items-center justify-center w-full px-6 py-2.5 text-white duration-200 bg-black border-2 border-black rounded-full hover:bg-transparent hover:text-black focus:outline-none lg:w-auto text-sm"
              >
                Subscribe
                <MoveRight className="w-4 h-auto ml-2" />
              </button>

            </div>
          </form>
        </div>

        {/* TERMS */}
        <div className="mx-auto sm:max-w-lg sm:flex">
          <p className="mx-auto mt-3 text-xs text-gray-500">
            By subscribing, you agree with our{" "}
            <Link
              href="/terms"
              className="text-primary hover:text-black underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-primary hover:text-black underline"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>

      </div>
    </div>
  );
}
