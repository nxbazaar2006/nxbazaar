import Image from "next/image";
import Link from "next/link";

import HeroCarousel from "./HeroCarousel";
import SidebarCategories from "./SidebarCategories";

import advert from "@/public/adv.gif";

import { CircleDollarSign, FolderSync, HelpCircle } from "lucide-react";

import { getBanners } from "@/actions/banner";
import { getFrontendText, normalizeFrontendLocale } from "@/lib/frontendI18n";

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
}

const actionCardClass =
  "group mb-3 flex items-center gap-3 rounded-2xl bg-white/78 p-3 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset] transition-all duration-300 hover:-translate-y-0.5 dark:bg-white/5";

type Props = {
  lang?: string;
};

export default async function Hero({ lang }: Props) {
  const locale = normalizeFrontendLocale(lang);
  const text = getFrontendText(locale);
  const banners: Banner[] = await getBanners("");

  return (
    <div className="grid grid-cols-12 gap-4 mb-8">
      <SidebarCategories lang={lang} />

      <div
        className="
          border bg-card text-card-foreground shadow-sm min-w-0 overflow-hidden col-span-full overflow-hidden rounded-2xl p-3 sm:col-span-7
        "
      >
        <HeroCarousel banners={banners} />
      </div>

      <div
        className="
          border bg-card text-card-foreground shadow-sm min-w-0 overflow-hidden col-span-2 hidden rounded-2xl p-3 sm:block
        "
      >
        <Link href="#" className={actionCardClass}>
          <HelpCircle className="h-5 w-5 shrink-0 text-orange-500" />

          <div>
            <h2 className="text-foreground text-xs font-semibold uppercase tracking-wide">
              {text.sidebar.helpCenter}
            </h2>
            <p className="text-[0.65rem] text-muted-foreground">
              {text.sidebar.customerCare}
            </p>
          </div>
        </Link>

        <Link href="#" className={actionCardClass}>
          <FolderSync className="h-5 w-5 shrink-0 text-blue-500" />

          <div>
            <h2 className="text-foreground text-xs font-semibold uppercase tracking-wide">
              {text.sidebar.easyReturn}
            </h2>
            <p className="text-[0.65rem] text-muted-foreground">
              {text.sidebar.quickReturn}
            </p>
          </div>
        </Link>

        <Link href="/register-seller" className={actionCardClass}>
          <CircleDollarSign className="h-5 w-5 shrink-0 text-green-500" />

          <div>
            <h2 className="text-foreground text-xs font-semibold uppercase tracking-wide">
              {text.sidebar.sellOnLimi}
            </h2>
            <p className="text-[0.65rem] text-muted-foreground">
              {text.sidebar.visitors}
            </p>
          </div>
        </Link>

        <div className="overflow-hidden rounded-2xl">
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
