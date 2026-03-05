# MuseKit CMS — Gap Closure Plan

| Field          | Value                                    |
|----------------|------------------------------------------|
| **Version**    | 1.0                                      |
| **Date**       | March 5, 2026                            |
| **Status**     | Implemented                              |
| **Package**    | @musekit/cms                             |
| **Repository** | SpeckledDarth/musekit-cms                |

---

## Overview

This document describes two deliverables to close existing gaps in the MuseKit CMS module. Both additions build on the existing codebase without introducing new dependencies or breaking changes.

**Deliverable 1 (High Priority):** ChangelogList — a timeline-style changelog component  
**Deliverable 2 (Medium Priority):** Default Landing Page Configuration — a ready-to-use section config with realistic content

---

## Deliverable 1: ChangelogList Component

### Purpose

Provide a public-facing changelog page that displays blog posts relevant to product updates in a clean, filterable timeline layout. This complements the existing `BlogList` component by offering a specialized view for release notes and changelogs.

### File Location

`src/blog/ChangelogList.tsx`

### Data Source

Same as `BlogList` — queries the `content_posts` Supabase table using `getBrowserClient()` from `src/lib/supabase.ts`.

**Filtering logic:**
- Fetches published posts where `category` is one of: `"Release"`, `"Product Updates"`, `"Changelog"`
- OR where `tags` array contains any of: `"release"`, `"update"`, `"feature"`, `"fix"`
- Ordered by `published_at` descending

### Filter Buttons

Displayed at the top of the component:

| Button     | Behavior                                   |
|------------|---------------------------------------------|
| All        | Shows all changelog-relevant posts          |
| Releases   | Shows posts tagged `"release"`              |
| Updates    | Shows posts tagged `"update"`               |
| Features   | Shows posts tagged `"feature"`              |
| Fixes      | Shows posts tagged `"fix"`                  |

### Timeline Layout

- Posts are grouped by month/year (e.g., "March 2026", "February 2026")
- Each month group has a date header
- Posts within a month are displayed as timeline entries connected by a vertical line
- Each entry displays:
  - **Tag badge** — colored by type (see table below)
  - **Date** — formatted (e.g., "Mar 4, 2026")
  - **Title** — clickable link to `/blog/${slug}`
  - **Summary** — excerpt if available, otherwise first ~150 characters of content

### Tag Badge Colors

| Tag       | Light Mode                              | Dark Mode                                  |
|-----------|-----------------------------------------|---------------------------------------------|
| release   | `bg-blue-100 text-blue-800`            | `dark:bg-blue-900/30 dark:text-blue-300`   |
| update    | `bg-green-100 text-green-800`          | `dark:bg-green-900/30 dark:text-green-300` |
| feature   | `bg-purple-100 text-purple-800`        | `dark:bg-purple-900/30 dark:text-purple-300`|
| fix       | `bg-orange-100 text-orange-800`        | `dark:bg-orange-900/30 dark:text-orange-300`|
| default   | `bg-gray-100 text-gray-800`            | `dark:bg-gray-800 dark:text-gray-300`      |

### States

| State    | Behavior                                                        |
|----------|-----------------------------------------------------------------|
| Loading  | Skeleton placeholders (animated pulse, same pattern as BlogList)|
| Empty    | Centered message: "No changelog entries yet. Check back soon for updates." with a muted icon |
| Loaded   | Timeline view with grouped posts                                |

### Component Signature

```tsx
"use client";
export function ChangelogList(): JSX.Element
```

- No props required — fetches its own data
- Uses `"use client"` directive
- All imports use relative paths (no `@/` aliases)

---

## Deliverable 2: Default Landing Page Configuration

### Purpose

Provide a complete, realistic `SectionConfig[]` that the integration Repl can pass to `LandingPageBuilder` to render a polished landing page without any admin configuration. This is what users see on first visit.

### File Location

`src/landing/default-config.ts`

### Exports

```ts
export const defaultLandingConfig: SectionConfig[];
export function getLandingConfig(): SectionConfig[];
```

`getLandingConfig()` currently returns `defaultLandingConfig` directly. In the future, it could fetch admin-configured overrides from the database.

### Section Configuration

All sections have `enabled: true`.

#### 1. Hero Section (sortOrder: 1)

| Prop               | Value                                                     |
|--------------------|-----------------------------------------------------------|
| type               | `"hero"`                                                  |
| style              | `"pattern"`                                               |
| headline           | `"Build Your SaaS Faster"`                                |
| subheadline        | About MuseKit being a complete SaaS starter kit           |
| ctaText            | `"Get Started"`                                           |
| ctaLink            | `"/signup"`                                               |
| secondaryCtaText   | `"Learn More"`                                            |
| secondaryCtaLink   | `"/features"`                                             |

#### 2. Feature Cards (sortOrder: 2)

| Prop     | Value                               |
|----------|---------------------------------------|
| type     | `"feature-cards"`                     |
| title    | `"Everything You Need to Launch"`     |
| subtitle | About the complete toolkit            |
| columns  | `3`                                   |

**6 features:**

| Icon              | Title                     | Description Summary                         |
|-------------------|---------------------------|---------------------------------------------|
| `Shield`          | Auth & Users              | Secure authentication and user management   |
| `CreditCard`      | Billing & Subscriptions   | Stripe integration with subscription plans  |
| `LayoutDashboard` | Admin Dashboard           | Full admin panel for managing everything     |
| `Mail`            | Email System              | Transactional emails and templates           |
| `Sparkles`        | AI Integration            | Built-in AI-powered content tools            |
| `FileText`        | Blog & CMS                | Complete content management system           |

#### 3. Process Steps (sortOrder: 3)

| Prop     | Value                             |
|----------|-------------------------------------|
| type     | `"process-steps"`                   |
| title    | `"Get Started in Minutes"`          |
| subtitle | About the simple setup process      |

**4 steps:**

| Step | Title                       | Description Summary                                |
|------|-----------------------------|-----------------------------------------------------|
| 1    | Clone the Repo              | Get the codebase with one command                   |
| 2    | Configure Your Settings     | Set up environment variables and connect services   |
| 3    | Customize the Design        | Tailor branding, colors, and components             |
| 4    | Launch Your Product         | Deploy to production with confidence                |

#### 4. Testimonial Carousel (sortOrder: 4)

| Prop | Value                        |
|------|-------------------------------|
| type | `"testimonial-carousel"`      |

**3 testimonials** with realistic names, roles, companies, and quotes praising the platform's speed, completeness, and developer experience.

#### 5. FAQ Section (sortOrder: 5)

| Prop  | Value                                  |
|-------|------------------------------------------|
| type  | `"faq"`                                  |
| title | `"Frequently Asked Questions"`           |

**5 questions:**

| # | Question                              | Answer Summary                                         |
|---|---------------------------------------|--------------------------------------------------------|
| 1 | What is MuseKit?                      | Complete SaaS starter kit with auth, billing, CMS, etc.|
| 2 | What tech stack does it use?          | Next.js 14, React 18, Tailwind CSS v3, Supabase, TS   |
| 3 | How do I customize it?               | Brand settings, Tailwind theme, modular components     |
| 4 | Is it production-ready?              | Yes, battle-tested patterns, secure defaults           |
| 5 | What support is included?            | Documentation, community, and optional premium support |

#### 6. Bottom Hero CTA (sortOrder: 6)

| Prop         | Value                                        |
|--------------|----------------------------------------------|
| type         | `"bottom-hero-cta"`                          |
| headline     | `"Ready to Launch?"`                         |
| subheadline  | About getting started today                  |
| ctaText      | `"Start Building"`                           |
| ctaLink      | `"/signup"`                                  |

### Props Validation

All props have been verified against the actual component interfaces in `src/landing/`. The `SectionConfig` type is imported from `./LandingPageBuilder` using a relative import.

---

## Import Convention

**All new code will use relative imports.** This is a deliberate decision to avoid issues with `@/` path aliases during integration with other Repls.

Examples:
- `import { cn, formatDate } from "../lib/utils";`
- `import { getBrowserClient } from "../lib/supabase";`
- `import type { SectionConfig } from "./LandingPageBuilder";`

Existing files being edited (barrel exports in `index.ts` files) will keep their current import style since they only reference local siblings (e.g., `"./ChangelogList"`).

---

## Files Affected

### New Files

| File                             | Type          |
|----------------------------------|---------------|
| `src/blog/ChangelogList.tsx`     | Component     |
| `src/landing/default-config.ts`  | Configuration |

### Modified Files (export updates only)

| File                    | Change                                              |
|-------------------------|------------------------------------------------------|
| `src/blog/index.ts`    | Add `ChangelogList` export                           |
| `src/landing/index.ts` | Add `defaultLandingConfig`, `getLandingConfig` exports|
| `src/index.ts`         | Add all new exports to main barrel                   |

### No Changes

- No existing component logic is modified
- No new npm dependencies
- No changes to `package.json`, `next.config.mjs`, or `tailwind.config.ts`

---

## Acceptance Criteria

- [x] `ChangelogList` renders a timeline of filtered blog posts
- [x] `ChangelogList` handles empty state gracefully
- [x] `ChangelogList` is exported from `src/blog/index.ts` and `src/index.ts`
- [x] `defaultLandingConfig` provides a complete, valid section configuration
- [x] `getLandingConfig()` is exported from `src/index.ts`
- [x] All new files use relative imports (no `@/` aliases)
- [x] All files have `"use client"` directive where needed (components only, not config)
- [x] No new npm dependencies introduced
- [x] TypeScript compiles without errors (`npx next build`)
- [x] App runs correctly after changes

---

## Change Log

| Version | Date           | Author | Changes                          |
|---------|----------------|--------|----------------------------------|
| 1.0     | March 5, 2026  | Agent  | Initial draft                    |
| 1.1     | March 5, 2026  | Agent  | Implementation complete — all acceptance criteria met |
