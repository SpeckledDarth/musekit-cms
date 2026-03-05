import type { SectionConfig } from "./LandingPageBuilder";

export const defaultLandingConfig: SectionConfig[] = [
  {
    type: "hero",
    enabled: true,
    sortOrder: 1,
    props: {
      style: "pattern",
      headline: "Build Your SaaS Faster",
      subheadline:
        "MuseKit is the complete SaaS starter kit. Authentication, billing, admin tools, email, AI, and a full CMS — all wired up and ready to customize.",
      ctaText: "Get Started",
      ctaLink: "/signup",
      secondaryCtaText: "Learn More",
      secondaryCtaLink: "/features",
    },
  },
  {
    type: "feature-cards",
    enabled: true,
    sortOrder: 2,
    props: {
      title: "Everything You Need to Launch",
      subtitle:
        "Stop piecing together boilerplate. MuseKit gives you a production-grade foundation so you can focus on what makes your product unique.",
      columns: 3,
      features: [
        {
          icon: "Shield",
          title: "Auth & Users",
          description:
            "Secure authentication with email, social logins, and role-based access control. User profiles and team management included.",
        },
        {
          icon: "CreditCard",
          title: "Billing & Subscriptions",
          description:
            "Stripe integration with subscription plans, usage-based billing, invoices, and a self-service customer portal.",
        },
        {
          icon: "LayoutDashboard",
          title: "Admin Dashboard",
          description:
            "A full admin panel for managing users, content, settings, and analytics. Built with a clean, responsive interface.",
        },
        {
          icon: "Mail",
          title: "Email System",
          description:
            "Transactional email templates for onboarding, notifications, and marketing. Configurable providers and delivery tracking.",
        },
        {
          icon: "Sparkles",
          title: "AI Integration",
          description:
            "Built-in AI-powered tools for content generation, smart suggestions, and automated workflows to boost productivity.",
        },
        {
          icon: "FileText",
          title: "Blog & CMS",
          description:
            "Complete content management with a markdown blog, landing page builder, legal pages, and SEO tools out of the box.",
        },
      ],
    },
  },
  {
    type: "process-steps",
    enabled: true,
    sortOrder: 3,
    props: {
      title: "Get Started in Minutes",
      subtitle:
        "Go from zero to a fully functional SaaS application in four straightforward steps.",
      steps: [
        {
          title: "Clone the Repo",
          description:
            "Get the entire MuseKit codebase with a single command. Everything is organized into modular packages you can adopt incrementally.",
        },
        {
          title: "Configure Your Settings",
          description:
            "Set your environment variables, connect Supabase and Stripe, and configure your domain. Guided setup makes it painless.",
        },
        {
          title: "Customize the Design",
          description:
            "Tailor your branding with the design system — colors, typography, and component styles all controlled from a central theme.",
        },
        {
          title: "Launch Your Product",
          description:
            "Deploy to production with confidence. MuseKit ships with secure defaults, performance optimizations, and monitoring built in.",
        },
      ],
    },
  },
  {
    type: "testimonial-carousel",
    enabled: true,
    sortOrder: 4,
    props: {
      testimonials: [
        {
          quote:
            "MuseKit saved us at least three months of development time. We launched our MVP in two weeks instead of four months.",
          name: "Sarah Chen",
          role: "CTO",
          company: "Pairwise Labs",
        },
        {
          quote:
            "The modular architecture is brilliant. We adopted the auth and billing packages first, then gradually pulled in the CMS and admin tools as we needed them.",
          name: "Marcus Rivera",
          role: "Lead Engineer",
          company: "Northwind Digital",
        },
        {
          quote:
            "Finally, a starter kit that feels production-ready from day one. The code quality and documentation are exceptional.",
          name: "Priya Sharma",
          role: "Founder",
          company: "Canopy Analytics",
        },
      ],
    },
  },
  {
    type: "faq",
    enabled: true,
    sortOrder: 5,
    props: {
      title: "Frequently Asked Questions",
      faqs: [
        {
          question: "What is MuseKit?",
          answer:
            "MuseKit is a complete SaaS starter kit that provides authentication, billing, an admin dashboard, email system, AI tools, and a full content management system. It is designed to give you a production-grade foundation so you can focus on building the features that make your product unique.",
        },
        {
          question: "What tech stack does it use?",
          answer:
            "MuseKit is built with Next.js 14, React 18, TypeScript, and Tailwind CSS v3 on the frontend. The backend uses Supabase for the database and authentication, with Stripe for payments. Each module is packaged independently so you can adopt them incrementally.",
        },
        {
          question: "How do I customize it?",
          answer:
            "Customization starts with brand settings — colors, typography, and logos are controlled through a central theme. Components are built with the MuseKit Design System, so styling changes propagate automatically. You can also extend or replace individual modules as your product grows.",
        },
        {
          question: "Is it production-ready?",
          answer:
            "Yes. MuseKit ships with secure defaults, role-based access control, input validation, and error handling throughout. The architecture follows battle-tested patterns used in production SaaS applications serving thousands of users.",
        },
        {
          question: "What support is included?",
          answer:
            "MuseKit includes comprehensive documentation, code examples, and an active community. For teams that need more, premium support packages with priority response times and architecture reviews are also available.",
        },
      ],
    },
  },
  {
    type: "bottom-hero-cta",
    enabled: true,
    sortOrder: 6,
    props: {
      headline: "Ready to Launch?",
      subheadline:
        "Stop rebuilding the same infrastructure. Start with MuseKit and ship your product faster.",
      ctaText: "Start Building",
      ctaLink: "/signup",
    },
  },
];

export function getLandingConfig(): SectionConfig[] {
  return defaultLandingConfig;
}
