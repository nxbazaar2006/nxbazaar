"use client";

import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type Banner = {
  imageUrl: string;
  title: string;
  link: string;
};

export default function HeroCarousel({ banners }: { banners: Banner[] }) {
  if (!banners?.length) return null;

  return (
    <Carousel
      opts={{
        loop: banners.length > 1,
        align: "start",
      }}
      plugins={[
        Autoplay({
          delay: 3000,
          stopOnInteraction: false,
          stopOnMouseEnter: true,
        }),
      ]}
      className="
        group relative overflow-hidden rounded-2xl
        border border-white/10 bg-white/10
        shadow-sm backdrop-blur-2xl
      "
    >
      <CarouselContent>
        {banners.map((banner, index) => (
          <CarouselItem key={`${banner.title}-${index}`}>
            <Link
              href={banner.link || "#"}
              aria-label={banner.title}
              className="block overflow-hidden rounded-2xl"
            >
              <Image
                width={712}
                height={384}
                src={banner.imageUrl}
                alt={banner.title}
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, 712px"
                className="
                  aspect-[712/384] w-full object-cover
                  transition-transform duration-700
                  group-hover:scale-[1.02]
                "
              />
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>

      {banners.length > 1 && (
        <>
          <CarouselPrevious
            className="
              left-3 hidden md:flex
              border-white/10 bg-white/10
              text-foreground backdrop-blur-xl
              shadow-md transition-all duration-300
              hover:scale-110 hover:bg-white/20
            "
          />

          <CarouselNext
            className="
              right-3 hidden md:flex
              border-white/10 bg-white/10
              text-foreground backdrop-blur-xl
              shadow-md transition-all duration-300
              hover:scale-110 hover:bg-white/20
            "
          />
        </>
      )}
    </Carousel>
  );
}