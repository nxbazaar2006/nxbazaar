import Link from "next/link";
import {
  CircleOff,
  CreditCard,
  Fullscreen,
  ShoppingBag,
  Shuffle,
} from "lucide-react";
import SearchForm from "./SearchForm";
import Faq from "./Faq";
import { LucideIcon } from "lucide-react";

type SupportLink = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export default function Support() {
  const supportLinks: SupportLink[] = [
    {
      title: "Place an Order",
      href: "/support/order",
      icon: ShoppingBag,
    },
    {
      title: "Pay for your Order",
      href: "/support/payment",
      icon: CreditCard,
    },
    {
      title: "Track your Order",
      href: "/support/track",
      icon: Fullscreen,
    },
    {
      title: "Cancel your Order",
      href: "/support/cancel",
      icon: CircleOff,
    },
    {
      title: "Create a return",
      href: "/support/return",
      icon: Shuffle,
    },
  ];

  return (
    <section className="flex w-full h-full flex-col">

      {/* HEADER */}
      <div className="bg-slate-900 absolute inset-x-0 -z-10 dark:bg-white text-white dark:text-black md:h-[20%] h-[30%] mx-auto md:px-8">
        <div className="md:px-8 py-4 px-3">
          <div className="flex flex-col gap-1 md:container md:px-[8rem] px-2">
            <span className="text-xl">Support Center</span>

            <p className="font-bold text-[1.5rem]">
              Hi, how can we help you?
            </p>

            <p className="md:hidden block font-bold text-[1rem]">
              You can try to find your problem here or contact us
            </p>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="px-2 pt-28 md:pt-16">

        {/* SUPPORT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8">
          {supportLinks.map((link) => {
            const Icon = link.icon;

            return (
              <Link
                key={link.title}
                href={link.href}
                className="bg-white dark:bg-slate-800 dark:text-white text-black flex flex-col items-center justify-center gap-2 py-12 px-6 rounded-2xl shadow-md hover:shadow-xl transition"
              >
                <Icon className="w-8 h-8" />
                <span className="text-sm font-medium text-center">
                  {link.title}
                </span>
              </Link>
            );
          })}
        </div>

        {/* SEARCH + FAQ */}
        <div className="mt-10 space-y-6">
          <div className="px-2 md:px-0">
            <SearchForm placeholderContent="Type keywords like 'return'" />
          </div>

          <Faq />
        </div>

      </div>
    </section>
  );
}