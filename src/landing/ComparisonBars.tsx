"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/src/lib/utils";

interface Comparison {
  label: string;
  before: number;
  after: number;
  unit?: string;
}

interface ComparisonBarsProps {
  title?: string;
  subtitle?: string;
  comparisons: Comparison[];
  beforeLabel?: string;
  afterLabel?: string;
  backgroundColor?: string;
  enabled?: boolean;
}

export function ComparisonBars({
  title,
  subtitle,
  comparisons,
  beforeLabel = "Before",
  afterLabel = "After",
  backgroundColor,
  enabled = true,
}: ComparisonBarsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  if (!enabled) return null;

  const maxValue = Math.max(...comparisons.flatMap((c) => [c.before, c.after]));

  return (
    <section ref={ref} className="py-20 px-4" style={{ backgroundColor }}>
      <div className="max-w-4xl mx-auto">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>}
            {subtitle && <p className="text-muted-foreground mt-3">{subtitle}</p>}
          </div>
        )}
        <div className="flex justify-end gap-6 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-muted-foreground/30" />
            <span className="text-muted-foreground">{beforeLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary" />
            <span className="text-muted-foreground">{afterLabel}</span>
          </div>
        </div>
        <div className="space-y-6">
          {comparisons.map((comp, i) => (
            <div key={i}>
              <p className="font-medium mb-2">{comp.label}</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                    <div
                      className={cn(
                        "h-full bg-muted-foreground/30 rounded-full transition-all duration-1000 ease-out",
                        !isVisible && "w-0"
                      )}
                      style={{ width: isVisible ? `${(comp.before / maxValue) * 100}%` : "0%" }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-16 text-right">
                    {comp.before}{comp.unit}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                    <div
                      className={cn(
                        "h-full bg-primary rounded-full transition-all duration-1000 ease-out delay-300",
                        !isVisible && "w-0"
                      )}
                      style={{ width: isVisible ? `${(comp.after / maxValue) * 100}%` : "0%" }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-16 text-right">
                    {comp.after}{comp.unit}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
