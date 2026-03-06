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
- `posts` — Blog posts, custom pages, features (columns: id, type, title, slug, excerpt, content, author_id, published, published_at, created_at, updated_at, seo_title, cover_image)
- `changelog_entries` — Changelog entries (columns: id, title, slug, content, category, published, published_at, created_at, updated_at)
- `waitlist_entries` — Waitlist signups
- `feedback` — NPS/feedback submissions
- `settings` — Key-value settings (columns: id, key, value — no updated_at). Branding keys: `branding.appName`, `branding.logoUrl`, `branding.faviconUrl`, `branding.description`
- `site_pages` — Dynamic pages built from sections (columns: slug, title, status, sections JSONB, seo_title, seo_description, og_image, canonical_url, no_index, show_in_nav, sort_order, created_at, updated_at)

## Project Structure
```
app/                    # Next.js App Router pages
├── page.tsx            # Landing page demo
├── blog/               # Blog routes
├── legal/[slug]/       # Legal page routes
├── admin/              # Admin dashboard
├── features/[slug]/    # Feature sub-pages
├── sitemap.ts          # Uses generateSitemap() from src/seo
├── robots.ts           # Uses generateRobots() from src/seo
└── components/         # App-level components (Navigation)
src/                    # Reusable CMS components
├── blog/               # BlogList, BlogPost, BlogEditor, BlogAdmin, ChangelogList, ChangelogAdmin
├── landing/            # 14 landing sections + LandingPageBuilder + DynamicPage + SiteNav + HomePageLoader
├── legal/              # 9 legal pages with LegalPageLayout
├── marketing/          # WaitlistForm, FeedbackWidget, SEOHead, etc.
├── custom-pages/       # CustomPage, CustomPageEditor
├── media/              # MediaLibrary, MediaPicker (Supabase Storage)
├── seo/                # SEO metadata functions, sitemap/robots generators, JSON-LD helpers
├── components/         # PageErrorBoundary
├── admin/              # AdminAuthGate
├── lib/                # Supabase client, utilities, auth, toast
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

## Authentication
- `src/lib/auth.tsx` — AuthProvider + useAuth hook using Supabase Auth (email/password)
- `src/admin/AdminAuthGate.tsx` — Login gate for admin pages; shows login form if unauthenticated
- Admin page passes `user.id` to BlogAdmin and CustomPageEditor as `userId` prop
- Create admin users via Supabase dashboard (Authentication > Users > Add user)

## Error Handling
- `src/lib/toast.tsx` — ToastProvider + useToast hook (success/error/info), wired in `app/layout.tsx`
- `src/components/PageErrorBoundary.tsx` — React error boundary with branded UI, "Try Again" / "Go Home" buttons, dev-only error details
- `app/error.tsx` — Global error boundary with retry
- `app/not-found.tsx` — Custom 404 page
- `app/blog/[slug]/not-found.tsx` — Blog-specific 404

## SEO Architecture
### Metadata Functions (`src/seo/metadata.ts`)
Server-side functions returning Next.js `Metadata` objects:
- `getPageMetadata(slug)` — For dynamic site pages (queries `site_pages`)
- `getHomePageMetadata()` — For homepage (queries `site_pages` where slug='home')
- `getBlogPostMetadata(slug)` — For blog posts (queries `posts`)
- `getBlogListMetadata()` — For blog listing page
- `getLegalPageMetadata(slug)` — For legal pages (maps slug to title)
- `getBrandSettings()` — Queries `settings` table for branding values

### Sitemap & Robots (`src/seo/sitemap.ts`, `src/seo/robots.ts`)
- `generateSitemap(baseUrl)` — Queries site_pages + posts, includes static/legal routes with proper priorities
- `generateRobots(baseUrl)` — Allows public pages, disallows /admin/, /dashboard/, /api/, /login/, /signup/, /auth/
- Wired into `app/sitemap.ts` and `app/robots.ts`

### JSON-LD Structured Data (`src/seo/json-ld.ts`)
- `getOrganizationSchema(brandSettings)` — Organization schema
- `getWebPageSchema(page, baseUrl)` — WebPage schema
- `getArticleSchema(post, baseUrl)` — Article schema (used on blog post pages)
- `getBreadcrumbSchema(breadcrumbs)` — BreadcrumbList schema
- `getFAQSchema(faqs)` — FAQPage schema for rich results

### Image Optimization
- All landing section components use `next/image` instead of `<img>` tags
- Proper `sizes` and `priority` props for responsive/above-fold images
- `next.config.mjs` allows all HTTPS remote image sources

### Heading Hierarchy
- LandingPageBuilder enforces h1/h2 rules: first hero gets `<h1>`, subsequent heroes get `<h2>`
- Section titles use `<h2>`, sub-items use `<h3>`

### Performance Headers (`next.config.mjs`)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- Static assets: `Cache-Control: public, max-age=31536000, immutable`
- Preconnect hints for Supabase URL in root layout

## Dynamic Pages
- `DynamicPage` component (`src/landing/DynamicPage.tsx`) — Renders pages from `site_pages` table via LandingPageBuilder. Supports preview mode with dismissible banner.
- `SiteNav` component (`src/landing/SiteNav.tsx`) — Dynamic navigation from `site_pages` where `show_in_nav=true`. Caches query in React state.
- `HomePageLoader` component (`src/landing/HomePageLoader.tsx`) — Loads homepage from `site_pages`, falls back to `defaultLandingConfig`.

## Commands
- `npm run dev` — Development server on port 5000
- `npm run build` — Production build
- `npm run start` — Production server on port 5000
