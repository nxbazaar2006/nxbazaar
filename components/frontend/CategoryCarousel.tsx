"use client";

import React from "react";
import Product from "./Product";
import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type Props = {
  products: Array<React.ComponentProps<typeof Product>["product"]>;
  isMarketPage?: boolean;
};

export default function CategoryCarousel({
  products,
  isMarketPage = false,
}: Props) {
  if (!products?.length) return null;

  const desktopBasis = isMarketPage ? "lg:basis-1/3" : "lg:basis-1/4";

  return (
    <Carousel
      opts={{
        align: "start",
        loop: products.length > 4,
      }}
      plugins={[
        Autoplay({
          delay: 5000,
          stopOnInteraction: false,
          stopOnMouseEnter: true,
        }),
      ]}
      className="group relative w-full"
    >
      <CarouselContent className="-ml-3 md:-ml-4">
        {products.map((product) => (
          <CarouselItem
            key={product.id}
            className={`
              pl-3 md:pl-4
              basis-1/2
              md:basis-1/3
              ${desktopBasis}
            `}
          >
            <Product product={product} />
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious
        className="
          hidden md:flex
          border-white/10 bg-white/10 backdrop-blur-xl
          shadow-md transition-all duration-300
          hover:scale-110 hover:bg-white/20
          -left-4
        "
      />

      <CarouselNext
        className="
          hidden md:flex
          border-white/10 bg-white/10 backdrop-blur-xl
          shadow-md transition-all duration-300
          hover:scale-110 hover:bg-white/20
          -right-4
        "
      />
    </Carousel>
  );
}