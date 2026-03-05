# MuseKit CMS

## Overview
Content management system for the MuseKit SaaS platform. Built with Next.js 14.2.18, React 18.3.1, Tailwind CSS 3.4.x, and TypeScript in strict mode.

## Architecture
- **Framework**: Next.js 14 App Router
- **Port**: 5000 (dev and production)
- **Database**: Supabase (external)
- **Storage**: Supabase Storage (`media` bucket for uploaded images)
- **Styling**: Tailwind CSS v3 with CSS custom properties for theming

## Database Tables
- `posts` — Blog posts, custom pages, features (columns: id, type, title, slug, excerpt, content, author_id, published, published_at, created_at, updated_at)
- `changelog_entries` — Changelog entries (columns: id, title, slug, content, category, published, published_at, created_at, updated_at)
- `waitlist_entries` — Waitlist signups
- `feedback` — NPS/feedback submissions
- `settings` — Key-value settings (columns: id, key, value — no updated_at)

## Project Structure
```
app/                    # Next.js App Router pages
├── page.tsx            # Landing page demo
├── blog/               # Blog routes
├── legal/[slug]/       # Legal page routes
├── admin/              # Admin dashboard
├── features/[slug]/    # Feature sub-pages
├── sitemap.ts          # Auto-generated sitemap
├── robots.ts           # Auto-generated robots.txt
└── components/         # App-level components (Navigation)
src/                    # Reusable CMS components
├── blog/               # BlogList, BlogPost, BlogEditor, BlogAdmin, ChangelogList, ChangelogAdmin
├── landing/            # 14 landing sections + LandingPageBuilder + default-config
├── legal/              # 9 legal pages with LegalPageLayout
├── marketing/          # WaitlistForm, FeedbackWidget, SEOHead, etc.
├── custom-pages/       # CustomPage, CustomPageEditor (with metadata, search, sort, bulk)
├── media/              # MediaLibrary, MediaPicker (Supabase Storage)
├── lib/                # Supabase client, utilities
└── index.ts            # Barrel export
```

## Dependencies
- `@musekit/shared` — Shared types and utilities (GitHub)
- `@musekit/database` — Supabase client and schema types (GitHub)
- `@musekit/design-system` — UI component library (GitHub)
- `react-markdown` + `remark-gfm` — Markdown rendering
- `lucide-react` — Icons

## Environment Secrets
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key

## SEO
- All dynamic routes export `generateMetadata()` using `generateSEOMeta` from `src/marketing/SEOHead.tsx`
- Blog posts include JSON-LD Article schema via `generateJsonLd`
- Sitemap (`app/sitemap.ts`) queries Supabase for published posts, changelog entries, features, and custom pages
- Admin routes use `robots: { index: false, follow: false }` via `app/admin/layout.tsx`

## Commands
- `npm run dev` — Development server on port 5000
- `npm run build` — Production build
- `npm run start` — Production server on port 5000
