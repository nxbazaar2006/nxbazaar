"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import Autoplay from "embla-carousel-autoplay";

type Market = {
  slug: string;
  title: string;
  logoUrl: string;
};

type Props = {
  markets: Market[];
  lang?: string;
};

export default function MarketsCarousel({ markets, lang }: Props) {
  if (!markets?.length) return null;

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      plugins={[
        Autoplay({
          delay: 5000,
        }),
      ]}
      className="w-full"
    >
      <CarouselContent>
        {markets.map((market, i) => (
          <CarouselItem
            key={i}
            className="
              basis-1/2
              md:basis-1/3
              lg:basis-1/6
              px-4
            "
          >
            <Link
              href={`/market/${market.slug}${lang ? `?lang=${lang}` : ""}`}
              className="block overflow-hidden rounded-2xl bg-white/78 p-2 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset] transition hover:-translate-y-1 dark:bg-white/5"
            >
             <Image
  src={market.logoUrl || "/placeholder.png"}
  alt={market.title}
  width={556}
  height={556}
  className="w-full rounded-2xl"
/>

              <h2 className="mt-2 text-center text-sm font-medium text-foreground">
                {market.title}
              </h2>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious className="hidden md:flex" />
      <CarouselNext className="hidden md:flex" />
    </Carousel>
  );
}
