"use client";

import Image from "next/image";

interface LogoMarqueeProps {
  logos: { src: string; alt: string }[];
  speed?: number;
  backgroundColor?: string;
  enabled?: boolean;
}

export function LogoMarquee({
  logos,
  speed = 30,
  backgroundColor,
  enabled = true,
}: LogoMarqueeProps) {
  if (!enabled || logos.length === 0) return null;

  const duplicatedLogos = [...logos, ...logos];

  return (
    <section className="py-12 overflow-hidden" style={{ backgroundColor }}>
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <p className="text-center text-sm text-muted-foreground font-medium uppercase tracking-wider">
          Trusted by leading companies
        </p>
      </div>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
        <div
          className="flex items-center gap-16 animate-marquee"
          style={{ animationDuration: `${speed}s` }}
        >
          {duplicatedLogos.map((logo, i) => (
            <div key={i} className="relative h-8 md:h-10 w-24 md:w-32 flex-shrink-0">
              <Image
                src={logo.src}
                alt={logo.alt}
                fill
                sizes="(max-width: 768px) 96px, 128px"
                className="object-contain opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
