import Image from "next/image";
import Link from "next/link";

import HeroCarousel from "./HeroCarousel";
import SidebarCategories from "./SidebarCategories";

import advert from "@/public/adv.gif";

import { CircleDollarSign, FolderSync, HelpCircle } from "lucide-react";

import { getBanners } from "@/actions/banner";

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
}

const actionCardClass =
  "apple-glass-soft group mb-3 flex items-center gap-3 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg";

export default async function Hero() {
  const banners: Banner[] = await getBanners("");

  return (
    <div className="mb-8 grid grid-cols-12 gap-6">
      <SidebarCategories />

      <div
        className="
          apple-glass col-span-full overflow-hidden p-3 sm:col-span-7
        "
      >
        <HeroCarousel banners={banners} />
      </div>

      <div
        className="
          apple-glass col-span-2 hidden p-3 sm:block
        "
      >
        <Link href="#" className={actionCardClass}>
          <HelpCircle className="h-5 w-5 shrink-0 text-orange-500" />

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide">
              Help Center
            </h2>
            <p className="text-[0.65rem] text-muted-foreground">
              Guide to customer care
            </p>
          </div>
        </Link>

        <Link href="#" className={actionCardClass}>
          <FolderSync className="h-5 w-5 shrink-0 text-blue-500" />

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide">
              Easy Return
            </h2>
            <p className="text-[0.65rem] text-muted-foreground">
              Quick return
            </p>
          </div>
        </Link>

        <Link href="/register-seller" className="apple-glass-soft group mb-6 flex items-center gap-3 bg-gradient-to-r from-orange-500/15 via-pink-500/15 to-purple-500/15 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
          <CircleDollarSign className="h-5 w-5 shrink-0 text-green-500" />

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide">
              Sell on Limi
            </h2>
            <p className="text-[0.65rem] text-muted-foreground">
              Millions of visitors
            </p>
          </div>
        </Link>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <Image
            src={advert}
            alt="Advertisement"
            className="h-auto w-full object-cover"
            priority
          />
        </div>
      </div>
    </div>
  );
}
