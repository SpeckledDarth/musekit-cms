# @musekit/cms

Content management module for the MuseKit SaaS platform. Provides blog, landing pages, legal pages, and marketing tools.

## Tech Stack

- **Framework**: Next.js 14.2.18
- **UI**: React 18.3.1 + Tailwind CSS 3.4.x
- **Language**: TypeScript (strict mode)
- **Database**: Supabase (via `@supabase/supabase-js`)
- **Dependencies**: `@musekit/shared`, `@musekit/database`, `@musekit/design-system`

## Module Structure

```
src/
├── blog/           # Blog/Changelog system
│   ├── BlogList.tsx        # Public blog listing page
│   ├── BlogPost.tsx        # Individual post with markdown rendering
│   ├── BlogEditor.tsx      # Admin markdown editor with live preview
│   └── BlogAdmin.tsx       # Admin CRUD interface
├── landing/        # 14 Landing page sections
│   ├── HeroSection.tsx         # 6 hero styles
│   ├── LogoMarquee.tsx         # Scrolling logos
│   ├── AnimatedCounters.tsx    # Count-up metrics
│   ├── FeatureCards.tsx        # Feature grid
│   ├── TestimonialCarousel.tsx # Customer stories
│   ├── ProcessSteps.tsx        # How-it-works steps
│   ├── FAQSection.tsx          # Accordion FAQ
│   ├── FounderLetter.tsx       # Founder message
│   ├── ComparisonBars.tsx      # Before/after bars
│   ├── ScreenshotShowcase.tsx  # Product screenshots
│   ├── BottomHeroCTA.tsx       # Closing CTA
│   ├── ImageCollage.tsx        # Fan-style images
│   ├── ImageTextBlocks.tsx     # Alternating rows
│   ├── FeatureSubPage.tsx      # /features/[slug] template
│   └── LandingPageBuilder.tsx  # Section assembler
├── legal/          # 9 Legal pages
│   ├── legal-content.ts        # All legal page content
│   └── LegalPageLayout.tsx     # Sidebar layout + markdown render
├── marketing/      # Marketing tools
│   ├── WaitlistForm.tsx        # Email collection form
│   ├── WaitlistAdmin.tsx       # Admin with CSV export
│   ├── FeedbackWidget.tsx      # Floating NPS widget
│   ├── AnnouncementBar.tsx     # Top banner
│   ├── CookieConsentBanner.tsx # Cookie consent
│   └── SEOHead.tsx             # Meta tags, OG, JSON-LD
├── custom-pages/   # Custom page system
│   ├── CustomPage.tsx          # Dynamic page renderer
│   └── CustomPageEditor.tsx    # Admin page builder
├── lib/            # Shared utilities
│   ├── supabase.ts             # Supabase client helpers
│   └── utils.ts                # cn, formatDate, slugify, replaceVariables
└── index.ts        # Main export barrel
```

## Supabase Tables Required

- `content_posts` — blog posts, custom pages
- `brand_settings` — app name, colors, branding
- `feature_toggles` — section enable/disable
- `waitlist` — waitlist email entries
- `feedback` — NPS feedback submissions

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key

## Legal Page Variables

Legal pages support dynamic replacement:
- `{{appName}}` — Application name
- `{{companyName}}` — Company legal name
- `{{supportEmail}}` — Support email address
- `{{effectiveDate}}` — Policy effective date

## Dark Mode

All components support dark mode via the `.dark` CSS class on the root HTML element.
