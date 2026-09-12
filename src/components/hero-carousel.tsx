"use client";

import { ProductImage } from "@/components/product-image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronIcon } from "./icons";

export type Slide = {
  title: string;
  subtitle: string;
  href: string;
  image: string;
  tint: string;
};

export function HeroCarousel({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const go = useCallback(
    (delta: number) => setIndex((i) => (i + delta + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    if (paused || reduced.current) return;
    const t = setInterval(() => go(1), 6000);
    return () => clearInterval(t);
  }, [paused, go]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured departments"
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="relative h-[280px] overflow-hidden sm:h-[380px] lg:h-[500px]">
        {slides.map((slide, i) => (
          <div
            key={slide.title}
            className={`absolute inset-0 transition-opacity duration-500 ${
              i === index ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            aria-hidden={i !== index}
          >
            <div className="absolute inset-0" style={{ background: slide.tint }} />
            <ProductImage
              src={slide.image}
              alt=""
              priority={i === 0}
              sizes="100vw"
              className="object-cover opacity-45 mix-blend-luminosity"
            />
            <div className="relative mx-auto flex h-full max-w-[1500px] items-start px-6 pt-10 sm:pt-14">
              <div className="max-w-md rounded bg-surface/95 p-5 shadow-sm">
                <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
                  {slide.title}
                </h2>
                <p className="mt-2 text-sm text-muted">{slide.subtitle}</p>
                <Link
                  href={slide.href}
                  className="mt-4 inline-block rounded-full border border-cta-border bg-cta px-5 py-1.5 text-sm hover:bg-cta-hover"
                >
                  Shop now
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* The page content overlaps the bottom of the hero, as on the real site. */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-surface-alt" />
      </div>

      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Previous slide"
        className="absolute start-0 top-1/3 grid h-20 w-12 place-items-center text-ink/60 hover:bg-black/5 hover:text-ink"
      >
        <ChevronIcon className="h-8 w-8 rotate-180 rtl:rotate-0" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Next slide"
        className="absolute end-0 top-1/3 grid h-20 w-12 place-items-center text-ink/60 hover:bg-black/5 hover:text-ink"
      >
        <ChevronIcon className="h-8 w-8 rtl:rotate-180" />
      </button>

      <div className="absolute bottom-28 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((slide, i) => (
          <button
            key={slide.title}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}: ${slide.title}`}
            aria-current={i === index}
            className={`h-2 w-2 rounded-full ${i === index ? "bg-ink" : "bg-ink/30"}`}
          />
        ))}
      </div>
    </section>
  );
}
