"use client";

interface ScreenshotShowcaseProps {
  title?: string;
  subtitle?: string;
  screenshots: { src: string; alt: string; caption?: string }[];
  backgroundColor?: string;
  enabled?: boolean;
}

export function ScreenshotShowcase({
  title,
  subtitle,
  screenshots,
  backgroundColor,
  enabled = true,
}: ScreenshotShowcaseProps) {
  if (!enabled) return null;

  return (
    <section className="py-20 px-4 overflow-hidden" style={{ backgroundColor }}>
      <div className="max-w-7xl mx-auto">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>}
            {subtitle && <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">{subtitle}</p>}
          </div>
        )}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/10 to-transparent rounded-3xl -z-10 scale-110" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {screenshots.map((screenshot, i) => (
              <div key={i} className="group relative">
                <div className="overflow-hidden rounded-xl border border-border shadow-lg">
                  <img
                    src={screenshot.src}
                    alt={screenshot.alt}
                    className="w-full transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                {screenshot.caption && (
                  <p className="text-sm text-muted-foreground text-center mt-3">{screenshot.caption}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
