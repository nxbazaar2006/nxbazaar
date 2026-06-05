"use client";

import Image from "next/image";
import { useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

import { FreeMode, Navigation, Thumbs } from "swiper/modules";

type Props = {
  productImages?: string[];
  thumbnail?: string;
};

export default function ProductImageCarousel({
  productImages = [],
  thumbnail,
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
    <div className="col-span-3 space-y-3">

      {/* 🔥 Main Slider */}
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
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        {images.map((image, i) => (
          <SwiperSlide key={i}>
            <div className="relative overflow-hidden group">
              <Image
                src={image}
                alt="Product Image"
                width={600}
                height={600}
                className="h-[400px] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 🔥 Thumbnail Slider */}
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
              className={`cursor-pointer rounded-2xl border p-[2px] transition ${
                activeIndex === i
                  ? "border-slate-950/30 shadow-sm dark:border-white/30"
                  : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
              }`}
            >
              <Image
                src={image}
                alt="Thumbnail"
                width={120}
                height={120}
                className="rounded-lg object-cover"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
