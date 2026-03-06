# Parts F/G/H Implementation

**Version**: v1.0
**Context**: Prompt 11 Parts F (Dynamic Page Renderer), G (SEO Architecture), H (Error Boundaries)

## Summary

Implements the complete SEO architecture, dynamic page rendering system, and error boundaries for the MuseKit CMS package. These are the missing pieces needed for the integration Repl to wire full server-side SEO, dynamic page routing, and error handling.

## Part F: Dynamic Page Renderer

### F1. DynamicPage (`src/landing/DynamicPage.tsx`)
- "use client" component with `slug` and `preview` props
- Queries `site_pages` table, filters by `status='published'` unless preview mode
- Renders `<LandingPageBuilder sections={page.sections} />`
- Loading skeleton, 404 state, dismissible preview banner

### F2. SiteNav (`src/landing/SiteNav.tsx`)
- "use client" component with optional `className` prop
- Queries `site_pages` where `show_in_nav=true` AND `status='published'`, ordered by `sort_order`
- Maps `slug="home"` to `/`, all others to `/<slug>`
- Caches result in React state, returns null while loading

### F3. HomePageLoader (`src/landing/HomePageLoader.tsx`)
- "use client" component, no props
- Queries `site_pages` where `slug='home'` and `status='published'`
- Falls back to `defaultLandingConfig` if no DB row found
- Loading skeleton while fetching

## Part G: SEO Architecture

### G1. Metadata Functions (`src/seo/metadata.ts`)
Five server-side functions returning Next.js `Metadata` objects:
- `getPageMetadata(slug)` — Dynamic site pages
- `getHomePageMetadata()` — Homepage
- `getBlogPostMetadata(slug)` — Blog posts (OG type: article)
- `getBlogListMetadata()` — Blog listing
- `getLegalPageMetadata(slug)` — Legal pages with slug-to-title mapping

Helper: `getBrandSettings()` queries `settings` table for `branding.*` keys with sensible defaults.

### G2. Sitemap Generator (`src/seo/sitemap.ts`)
- `generateSitemap(baseUrl)` — Queries `site_pages` (published, not no_index) and `posts` (published)
- Includes static routes: `/pricing`, `/login`, `/signup`, `/blog`, `/features`
- Priorities: homepage=1.0, pages=0.8, pricing=0.7, blog=0.6, auth=0.3, legal=0.2
- Wired into `app/sitemap.ts`

### G3. Robots Generator (`src/seo/robots.ts`)
- `generateRobots(baseUrl)` — Allow all public, disallow `/admin/`, `/dashboard/`, `/api/`, `/login/`, `/signup/`, `/auth/`
- Wired into `app/robots.ts`

### G4. JSON-LD Helpers (`src/seo/json-ld.ts`)
- `getOrganizationSchema(brandSettings)` — Organization
- `getWebPageSchema(page, baseUrl)` — WebPage
- `getArticleSchema(post, baseUrl)` — Article (wired into blog post pages)
- `getBreadcrumbSchema(breadcrumbs)` — BreadcrumbList
- `getFAQSchema(faqs)` — FAQPage for Google rich results

Types exported: `BrandSettings`, `SitePage`, `BlogPost`

### G5. next/image Migration
Updated all landing section components from `<img>` to `next/image`:
- HeroSection (background, mockup, collage images) — with `priority` for hero
- FounderLetter (portrait, signature)
- ScreenshotShowcase (screenshot images)
- ImageCollage (collage images)
- ImageTextBlocks (block images)
- TestimonialCarousel (avatar images)
- LogoMarquee (logo images)
- FeatureSubPage (hero image, section images)

All use `fill` with relative containers, `sizes` prop for responsive srcset.

Added `images.remotePatterns` to `next.config.mjs` for external HTTPS sources.

### G6. Heading Hierarchy
- `LandingPageBuilder` tracks hero count and passes `headingLevel` prop to HeroSection
- First hero renders `<h1>`, subsequent heroes render `<h2>`
- Section titles already use `<h2>`, sub-items use `<h3>` — verified across all 13 sections
- FounderLetter updated from `<h3>` to `<h2>` for the author name

### G7. Blog Post SEO
- `app/blog/[slug]/page.tsx` now uses `getBlogPostMetadata()` for `generateMetadata`
- Blog post pages include `getArticleSchema()` JSON-LD
- `app/blog/page.tsx` now uses `getBlogListMetadata()` for `generateMetadata`

### G8. Performance Headers
In `next.config.mjs`:
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- Static assets: `Cache-Control: public, max-age=31536000, immutable`

In `app/layout.tsx`:
- `<link rel="preconnect">` and `<link rel="dns-prefetch">` for Supabase URL

## Part H: Error Boundaries

### PageErrorBoundary (`src/components/PageErrorBoundary.tsx`)
- "use client" React class-based error boundary
- Catches rendering errors via `getDerivedStateFromError`
- Shows "Something went wrong" with "Try Again" and "Go Home" buttons
- Error details (message + stack) visible only in development mode
- Uses inline styles for self-contained rendering

## Barrel Exports

### `src/seo/index.ts`
All metadata functions, generators, and JSON-LD helpers exported.

### `src/index.ts`
Added exports for: `DynamicPage`, `SiteNav`, `HomePageLoader`, `PageErrorBoundary`, and all SEO functions/types.

## Files

| File | Change |
|---|---|
| `src/landing/DynamicPage.tsx` | NEW — Dynamic page renderer |
| `src/landing/SiteNav.tsx` | NEW — Dynamic navigation |
| `src/landing/HomePageLoader.tsx` | NEW — Homepage loader with fallback |
| `src/seo/metadata.ts` | NEW — 5 metadata functions + getBrandSettings |
| `src/seo/sitemap.ts` | NEW — generateSitemap function |
| `src/seo/robots.ts` | NEW — generateRobots function |
| `src/seo/json-ld.ts` | NEW — 5 JSON-LD helper functions + types |
| `src/seo/index.ts` | NEW — SEO barrel exports |
| `src/components/PageErrorBoundary.tsx` | NEW — Error boundary component |
| `src/components/index.ts` | NEW — Components barrel |
| `src/landing/HeroSection.tsx` | next/image + headingLevel prop |
| `src/landing/FounderLetter.tsx` | next/image + heading fix |
| `src/landing/ScreenshotShowcase.tsx` | next/image |
| `src/landing/ImageCollage.tsx` | next/image |
| `src/landing/ImageTextBlocks.tsx` | next/image |
| `src/landing/TestimonialCarousel.tsx` | next/image |
| `src/landing/LogoMarquee.tsx` | next/image |
| `src/landing/FeatureSubPage.tsx` | next/image |
| `src/landing/LandingPageBuilder.tsx` | headingLevel context for heroes |
| `src/landing/index.ts` | Added DynamicPage, SiteNav, HomePageLoader |
| `src/index.ts` | Added all new exports |
| `app/sitemap.ts` | Uses generateSitemap() |
| `app/robots.ts` | Uses generateRobots() |
| `app/blog/[slug]/page.tsx` | Uses getBlogPostMetadata + getArticleSchema |
| `app/blog/page.tsx` | Uses getBlogListMetadata |
| `next.config.mjs` | images config + security/performance headers |
| `app/layout.tsx` | Preconnect hints |

---

## Changelog

| Version | Date | Changes |
|---|---|---|
| v1.0 | 2026-03-06 | Parts F/G/H: Dynamic pages, full SEO architecture, next/image migration, heading hierarchy, performance headers, PageErrorBoundary |
