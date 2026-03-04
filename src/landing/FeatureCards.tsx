"use client";

import * as LucideIcons from "lucide-react";

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface FeatureCardsProps {
  title?: string;
  subtitle?: string;
  features: Feature[];
  columns?: 2 | 3 | 4;
  backgroundColor?: string;
  enabled?: boolean;
}

export function FeatureCards({
  title,
  subtitle,
  features,
  columns = 3,
  backgroundColor,
  enabled = true,
}: FeatureCardsProps) {
  if (!enabled) return null;

  const colClass = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <section className="py-20 px-4" style={{ backgroundColor }}>
      <div className="max-w-7xl mx-auto">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>}
            {subtitle && <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">{subtitle}</p>}
          </div>
        )}
        <div className={`grid ${colClass} gap-6`}>
          {features.map((feature, i) => {
            const IconComponent = (LucideIcons as Record<string, any>)[feature.icon] || LucideIcons.Star;
            return (
              <div
                key={i}
                className="p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <IconComponent className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
