"use client";

import Image from "next/image";
import { useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";

// @ts-expect-error Swiper CSS subpaths do not ship TypeScript declarations.
import "swiper/css";
// @ts-expect-error Swiper CSS subpaths do not ship TypeScript declarations.
import "swiper/css/free-mode";
// @ts-expect-error Swiper CSS subpaths do not ship TypeScript declarations.
import "swiper/css/navigation";
// @ts-expect-error Swiper CSS subpaths do not ship TypeScript declarations.
import "swiper/css/thumbs";

import { FreeMode, Navigation, Thumbs } from "swiper/modules";

type Props = {
  productImages?: string[];
  thumbnail?: string;
  title?: string;
};

export default function ProductImageCarousel({
  productImages = [],
  thumbnail,
  title = "Product image",
}: Props) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const images =
    productImages?.length > 0
      ? productImages
      : thumbnail
      ? [thumbnail]
      : ["/placeholder.png"]; // fallback

  return (
    <div className="space-y-3">
      <Swiper
        spaceBetween={10}
        navigation
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        thumbs={{
          swiper:
            thumbsSwiper && !thumbsSwiper.destroyed
              ? thumbsSwiper
              : null,
        }}
        modules={[FreeMode, Navigation, Thumbs]}
        className="border bg-card text-card-foreground shadow-sm overflow-hidden rounded-2xl"
      >
        {images.map((image, i) => (
          <SwiperSlide key={i}>
            <div className="group relative overflow-hidden">
              <Image
                src={image}
                alt={title}
                width={900}
                height={900}
                priority={i === 0}
                className="h-64 w-full object-contain p-3 transition-transform duration-500 group-hover:scale-[1.03] sm:h-72 lg:h-80 xl:h-96"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <Swiper
        onSwiper={setThumbsSwiper}
        spaceBetween={10}
        slidesPerView={4}
        freeMode
        watchSlidesProgress
        modules={[FreeMode, Thumbs]}
      >
        {images.map((image, i) => (
          <SwiperSlide key={i}>
            <div
              className={`cursor-pointer overflow-hidden rounded-2xl border p-1 transition ${
                activeIndex === i
                  ? "border-orange-500 ring-1 ring-orange-400/70"
                  : "border bg-card text-card-foreground shadow-sm opacity-75 hover:opacity-100"
              }`}
            >
              <Image
                src={image}
                alt={`${title} thumbnail ${i + 1}`}
                width={88}
                height={88}
                className="aspect-square w-full rounded-2xl object-cover"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
