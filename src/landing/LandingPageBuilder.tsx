"use client";

import { HeroSection } from "./HeroSection";
import { LogoMarquee } from "./LogoMarquee";
import { AnimatedCounters } from "./AnimatedCounters";
import { FeatureCards } from "./FeatureCards";
import { TestimonialCarousel } from "./TestimonialCarousel";
import { ProcessSteps } from "./ProcessSteps";
import { FAQSection } from "./FAQSection";
import { FounderLetter } from "./FounderLetter";
import { ComparisonBars } from "./ComparisonBars";
import { ScreenshotShowcase } from "./ScreenshotShowcase";
import { BottomHeroCTA } from "./BottomHeroCTA";
import { ImageCollage } from "./ImageCollage";
import { ImageTextBlocks } from "./ImageTextBlocks";

export interface SectionConfig {
  type: string;
  enabled: boolean;
  sortOrder: number;
  backgroundColor?: string;
  props: Record<string, any>;
}

interface LandingPageBuilderProps {
  sections: SectionConfig[];
}

const sectionComponents: Record<string, React.ComponentType<any>> = {
  hero: HeroSection,
  "logo-marquee": LogoMarquee,
  "animated-counters": AnimatedCounters,
  "feature-cards": FeatureCards,
  "testimonial-carousel": TestimonialCarousel,
  "process-steps": ProcessSteps,
  faq: FAQSection,
  "founder-letter": FounderLetter,
  "comparison-bars": ComparisonBars,
  "screenshot-showcase": ScreenshotShowcase,
  "bottom-hero-cta": BottomHeroCTA,
  "image-collage": ImageCollage,
  "image-text-blocks": ImageTextBlocks,
};

export function LandingPageBuilder({ sections }: LandingPageBuilderProps) {
  const sortedSections = [...sections]
    .filter((s) => s.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  let heroCount = 0;

  return (
    <div>
      {sortedSections.map((section, i) => {
        const Component = sectionComponents[section.type];
        if (!Component) return null;

        const extraProps: Record<string, any> = {};

        if (section.type === "hero") {
          heroCount++;
          extraProps.headingLevel = heroCount === 1 ? "h1" : "h2";
        }

        return (
          <Component
            key={i}
            {...section.props}
            {...extraProps}
            backgroundColor={section.backgroundColor}
            enabled={section.enabled}
          />
        );
      })}
    </div>
  );
}
