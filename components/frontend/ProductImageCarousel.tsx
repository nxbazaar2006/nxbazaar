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
        className="rounded-lg overflow-hidden border-4 border-white"
      >
        {images.map((image, i) => (
          <SwiperSlide key={i}>
            <div className="relative overflow-hidden group">
              <Image
                src={image}
                alt="Product Image"
                width={600}
                height={600}
                className="w-full h-[400px] object-cover transition-transform duration-300 group-hover:scale-110"
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
              className={`p-[2px] rounded-md cursor-pointer border-white ${
                activeIndex === i
                  ? "border-2 border-orange-500"
                  : "border-2"
              }`}
            >
              <Image
                src={image}
                alt="Thumbnail"
                width={120}
                height={120}
                className="rounded-md object-cover"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
