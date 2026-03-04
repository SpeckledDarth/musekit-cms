"use client";

interface BottomHeroCTAProps {
  headline: string;
  subheadline?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  backgroundColor?: string;
  enabled?: boolean;
}

export function BottomHeroCTA({
  headline,
  subheadline,
  ctaText = "Get Started",
  ctaLink = "#",
  secondaryCtaText,
  secondaryCtaLink,
  backgroundColor,
  enabled = true,
}: BottomHeroCTAProps) {
  if (!enabled) return null;

  return (
    <section
      className="py-24 px-4 bg-gradient-to-br from-primary/10 via-background to-accent/10"
      style={{ backgroundColor }}
    >
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">{headline}</h2>
        {subheadline && (
          <p className="text-lg text-muted-foreground mb-8">{subheadline}</p>
        )}
        <div className="flex flex-wrap justify-center gap-4">
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
      </div>
    </section>
  );
}
