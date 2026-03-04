"use client";

import { HeroSection } from "@/src/landing/HeroSection";
import { FeatureCards } from "@/src/landing/FeatureCards";
import { ProcessSteps } from "@/src/landing/ProcessSteps";
import { FAQSection } from "@/src/landing/FAQSection";
import { AnimatedCounters } from "@/src/landing/AnimatedCounters";
import { BottomHeroCTA } from "@/src/landing/BottomHeroCTA";
import { WaitlistForm } from "@/src/marketing/WaitlistForm";
import { CookieConsentBanner } from "@/src/marketing/CookieConsentBanner";

export function LandingPageDemo() {
  return (
    <div>
      <HeroSection
        style="pattern"
        headline="Build Beautiful Content, Effortlessly"
        subheadline="MuseKit CMS gives you everything you need to manage blogs, landing pages, legal docs, and marketing tools — all in one place."
        ctaText="Get Started"
        ctaLink="/admin"
        secondaryCtaText="View Blog"
        secondaryCtaLink="/blog"
      />

      <AnimatedCounters
        counters={[
          { label: "Landing Sections", value: 14 },
          { label: "Legal Pages", value: 9 },
          { label: "Marketing Tools", value: 8 },
          { label: "Hero Styles", value: 6 },
        ]}
      />

      <FeatureCards
        title="Everything You Need"
        subtitle="A complete CMS toolkit for modern SaaS applications"
        features={[
          { icon: "FileText", title: "Blog System", description: "Full CRUD blog with markdown editor, live preview, categories, and tags." },
          { icon: "Layout", title: "Landing Pages", description: "14 customizable sections with drag-and-drop ordering and per-section styling." },
          { icon: "Shield", title: "Legal Pages", description: "9 pre-built legal pages with dynamic variable replacement." },
          { icon: "BarChart3", title: "Analytics Ready", description: "NPS feedback widget, waitlist management, and CSV exports." },
          { icon: "Palette", title: "Dark Mode", description: "Every component supports dark mode out of the box." },
          { icon: "Zap", title: "SEO Optimized", description: "Built-in SEO head component with Open Graph and JSON-LD support." },
        ]}
      />

      <ProcessSteps
        title="How It Works"
        subtitle="Get started in three simple steps"
        steps={[
          { title: "Connect Your Database", description: "Link your Supabase instance and the CMS automatically reads your content schema." },
          { title: "Create Content", description: "Use the admin interface to write blog posts, configure landing sections, and manage marketing tools." },
          { title: "Publish & Go", description: "Toggle content live with one click. Everything is SEO-ready and responsive by default." },
        ]}
      />

      <FAQSection
        faqs={[
          { question: "What tech stack does MuseKit CMS use?", answer: "Next.js 14, React 18, Tailwind CSS v3, TypeScript, and Supabase for the backend." },
          { question: "Can I customize the landing page sections?", answer: "Yes! Each of the 14 sections can be independently enabled/disabled, reordered, and styled with custom background colors." },
          { question: "How do legal pages work?", answer: "Legal pages use dynamic variable replacement — {{appName}}, {{companyName}}, {{supportEmail}}, and {{effectiveDate}} are automatically filled in from your brand settings." },
          { question: "Is dark mode supported?", answer: "Yes, every component and landing section fully supports dark mode." },
        ]}
      />

      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-accent/5">
        <WaitlistForm
          title="Stay in the Loop"
          description="Sign up to get notified when new features are released."
        />
      </section>

      <BottomHeroCTA
        headline="Ready to Build?"
        subheadline="Start managing your content with MuseKit CMS today."
        ctaText="Go to Admin"
        ctaLink="/admin"
      />

      <CookieConsentBanner />
    </div>
  );
}
