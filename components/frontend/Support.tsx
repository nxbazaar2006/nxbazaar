import Link from "next/link";
import {
  CircleOff,
  CreditCard,
  MapPinCheck,
  ShoppingBag,
  Shuffle,
} from "lucide-react";

import Newsletter from "../Support/Newsletter";
import Faq from "../Support/Faq";
import SearchForm from "../Support/SearchForm";

const supportLinks = [
  {
    title: "Place an Order",
    icon: ShoppingBag,
    href: "/support/place-order",
  },
  {
    title: "Pay for Your Order",
    icon: CreditCard,
    href: "/support/payment",
  },
  {
    title: "Track Your Order",
    icon: MapPinCheck,
    href: "/support/track-order",
  },
  {
    title: "Cancel an Order",
    icon: CircleOff,
    href: "/support/cancel-order",
  },
  {
    title: "Create a Return",
    icon: Shuffle,
    href: "/support/return",
  },
];

export default function Support() {
  return (
    <section className="flex flex-col w-full min-h-screen">

      {/* Hero Section */}

      <div className="bg-primaryColor text-white py-10 px-4 md:px-10">
        <div className="max-w-6xl mx-auto flex flex-col gap-2">

          <span className="text-xl font-medium">
            Support Center
          </span>

          <h1 className="text-3xl md:text-4xl font-bold">
            Hi, how can we help you?
          </h1>

          <p className="text-sm opacity-90 md:w-[500px]">
            Find answers to common questions or contact our support team for assistance.
          </p>

          <div className="mt-4">
            <SearchForm placeholderContent={"Search help articles..."} />
          </div>

        </div>
      </div>

      {/* Support Cards */}

      <div className="max-w-6xl mx-auto w-full px-4 md:px-0 mt-10">

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">

          {supportLinks.map((item, index) => {
            const Icon = item.icon;

            return (
              <Link
                key={index}
                href={item.href}
                className="group flex flex-col items-center justify-center gap-3 bg-white dark:bg-primaryColor text-black dark:text-white p-6 rounded-2xl shadow-md hover:shadow-xl transition duration-300 hover:-translate-y-1"
              >
                <Icon className="w-9 h-9 text-primaryColor group-hover:scale-110 transition" />

                <span className="text-sm font-medium text-center">
                  {item.title}
                </span>
              </Link>
            );
          })}
        </div>

      </div>

      {/* FAQ */}

      <div className="max-w-5xl mx-auto mt-16 px-4">
        <Faq />
      </div>

      {/* Newsletter */}

      <div className="max-w-5xl mx-auto mt-12 px-4">
        <Newsletter />
      </div>

    </section>
  );
}