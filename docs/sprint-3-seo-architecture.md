# Sprint 3: SEO Architecture

**Version**: v1.0  
**Sprint**: 3 of 4  
**Scope**: Part G (SEO Architecture)

## Summary

Sprint 3 wires the existing SEO utilities (`generateSEOMeta`, `generateJsonLd`) into all routes, adds `generateMetadata` exports for dynamic pages, upgrades the sitemap to include all published content from Supabase, adds JSON-LD structured data for blog posts, and applies noindex to the admin section.

## Changes by Route

### Homepage (`app/page.tsx`)
- Static `Metadata` export with full title, description, Open Graph, and Twitter card tags
- Site name set to "MuseKit"

### Blog Listing (`app/blog/page.tsx`)
- Static `Metadata` export with blog-specific title and description
- Open Graph type: website

### Blog Post (`app/blog/[slug]/page.tsx`)
- `generateMetadata()` fetches post from `posts` table (with `changelog_entries` fallback)
- Uses `generateSEOMeta` for title, description (excerpt or truncated content), canonical URL, type "article"
- Returns noIndex metadata for not-found posts
- JSON-LD `Article` schema injected as server-rendered `<script>` tag with headline, datePublished, dateModified, description, URL

### Feature Pages (`app/features/[slug]/page.tsx`)
- `generateMetadata()` fetches feature post from `posts` table
- Extracts description from excerpt, JSON-parsed content (hero.subtitle), or raw content
- Returns noIndex for not-found features

### Legal Pages (`app/legal/[slug]/page.tsx`)
- `generateMetadata()` looks up page title from `legalPages` object
- Title pattern: "{Page Title} — MuseKit"
- Returns noIndex for unknown slugs

### Admin (`app/admin/layout.tsx`) — NEW
- Separate layout file with `robots: { index: false, follow: false }`
- Keeps admin pages out of search indexes

### Sitemap (`app/sitemap.ts`)
- Now async — queries Supabase for all published content
- Includes: blog posts (`/blog/{slug}`), changelog entries (`/blog/{slug}`), feature pages (`/features/{slug}`), custom pages (`/{slug}`)
- Uses `updated_at`/`created_at` for accurate `lastModified` dates
- Admin page removed from sitemap
- Legal pages remain with monthly change frequency

### Robots (`app/robots.ts`)
- No changes needed — already blocks `/admin/` and `/api/`

## SEO Utilities Used

| Function | Source | Usage |
|---|---|---|
| `generateSEOMeta` | `src/marketing/SEOHead.tsx` | All dynamic routes' `generateMetadata` |
| `generateJsonLd` | `src/marketing/SEOHead.tsx` | Blog post Article schema |
| `SEOHead` | `src/marketing/SEOHead.tsx` | Available for client-side use (not used in routes) |

## Build Status

Clean build verified with `npx next build` — no TypeScript or compilation errors.

## Remaining Sprints

| Sprint | Scope |
|---|---|
| Sprint 4 | Error Boundaries + UX Polish (Parts H, E) |

---

## Changelog

| Version | Date | Changes |
|---|---|---|
| v1.0 | 2026-03-05 | Sprint 3 delivery: generateMetadata on all dynamic routes, JSON-LD for blog posts, dynamic sitemap with Supabase queries, admin noindex, homepage/blog metadata |
