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

export default function MarketsCarousel({ markets }: { markets: Market[] }) {
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
              href={`/market/${market.slug}`}
              className="apple-glass-soft block overflow-hidden p-2 transition hover:-translate-y-1 hover:bg-white/75 hover:shadow-lg dark:hover:bg-slate-950/45"
            >
             <Image
  src={market.logoUrl || "/placeholder.png"}
  alt={market.title}
  width={556}
  height={556}
  className="w-full rounded-xl"
/>

              <h2 className="text-center text-foreground mt-2">
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
