"use client";

import Image from "next/image";
import { cn } from "@/src/lib/utils";

type HeroStyle = "full-width" | "split" | "video" | "pattern" | "floating-mockup" | "photo-collage";

interface HeroSectionProps {
  style?: HeroStyle;
  headline: string;
  subheadline?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  backgroundImage?: string;
  videoUrl?: string;
  mockupImage?: string;
  images?: string[];
  backgroundColor?: string;
  enabled?: boolean;
  headingLevel?: "h1" | "h2";
}

export function HeroSection({
  style = "full-width",
  headline,
  subheadline,
  ctaText = "Get Started",
  ctaLink = "#",
  secondaryCtaText,
  secondaryCtaLink,
  backgroundImage,
  videoUrl,
  mockupImage,
  images = [],
  backgroundColor,
  enabled = true,
  headingLevel = "h1",
}: HeroSectionProps) {
  if (!enabled) return null;

  const Heading = headingLevel;

  const renderCTA = () => (
    <div className="flex flex-wrap gap-4 mt-8">
      <a
        href={ctaLink}
        className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
      >
        {ctaText}
      </a>
      {secondaryCtaText && (
        <a
          href={secondaryCtaLink || "#"}
          className="px-8 py-3 border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-colors"
        >
          {secondaryCtaText}
        </a>
      )}
    </div>
  );

  if (style === "split") {
    return (
      <section className="py-20 px-4" style={{ backgroundColor }}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Heading className="text-5xl md:text-6xl font-bold leading-tight">{headline}</Heading>
            {subheadline && <p className="text-xl text-muted-foreground mt-4">{subheadline}</p>}
            {renderCTA()}
          </div>
          <div className="relative">
            {backgroundImage && (
              <div className="relative w-full aspect-video">
                <Image
                  src={backgroundImage}
                  alt={headline}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="rounded-xl shadow-2xl object-cover"
                  priority
                />
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (style === "video") {
    return (
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden" style={{ backgroundColor }}>
        {videoUrl && (
          <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
            <source src={videoUrl} type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center text-white max-w-4xl px-4">
          <Heading className="text-5xl md:text-7xl font-bold leading-tight">{headline}</Heading>
          {subheadline && <p className="text-xl mt-4 opacity-90">{subheadline}</p>}
          {renderCTA()}
        </div>
      </section>
    );
  }

  if (style === "pattern") {
    return (
      <section
        className="relative py-24 px-4 bg-gradient-to-br from-primary/10 via-background to-accent/10"
        style={{ backgroundColor }}
      >
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <Heading className="text-5xl md:text-7xl font-bold leading-tight">{headline}</Heading>
          {subheadline && <p className="text-xl text-muted-foreground mt-4">{subheadline}</p>}
          <div className="flex justify-center">{renderCTA()}</div>
        </div>
      </section>
    );
  }

  if (style === "floating-mockup") {
    return (
      <section className="py-20 px-4" style={{ backgroundColor }}>
        <div className="max-w-7xl mx-auto text-center">
          <Heading className="text-5xl md:text-6xl font-bold leading-tight">{headline}</Heading>
          {subheadline && <p className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">{subheadline}</p>}
          <div className="flex justify-center">{renderCTA()}</div>
          {mockupImage && (
            <div className="mt-16 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
              <div className="relative max-w-4xl mx-auto w-full aspect-video">
                <Image
                  src={mockupImage}
                  alt="Product preview"
                  fill
                  sizes="(max-width: 768px) 100vw, 896px"
                  className="rounded-xl shadow-2xl object-cover"
                  priority
                />
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  if (style === "photo-collage") {
    return (
      <section className="py-20 px-4" style={{ backgroundColor }}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Heading className="text-5xl md:text-6xl font-bold leading-tight">{headline}</Heading>
            {subheadline && <p className="text-xl text-muted-foreground mt-4">{subheadline}</p>}
            {renderCTA()}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {images.slice(0, 4).map((img, i) => (
              <div
                key={i}
                className={cn(
                  "relative w-full",
                  i % 2 === 0 ? "h-48" : "h-56",
                  i === 0 && "mt-8"
                )}
              >
                <Image
                  src={img}
                  alt={`${headline} image ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="rounded-lg shadow-lg object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative min-h-[80vh] flex items-center justify-center"
      style={{
        backgroundColor,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {backgroundImage && <div className="absolute inset-0 bg-black/50" />}
      <div className="relative z-10 text-center max-w-4xl px-4">
        <Heading className={cn("text-5xl md:text-7xl font-bold leading-tight", backgroundImage && "text-white")}>
          {headline}
        </Heading>
        {subheadline && (
          <p className={cn("text-xl mt-4", backgroundImage ? "text-white/90" : "text-muted-foreground")}>
            {subheadline}
          </p>
        )}
        <div className="flex justify-center">{renderCTA()}</div>
      </div>
    </section>
  );
}
