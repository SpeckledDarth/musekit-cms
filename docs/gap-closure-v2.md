# Gap Closure v2 — Fix Table Names and Column Alignment

## Document Info

| Field          | Value                                    |
|----------------|------------------------------------------|
| **Version**    | 2.0                                      |
| **Date**       | March 5, 2026                            |
| **Status**     | Implemented                              |
| **Package**    | @musekit/cms                             |
| **Repository** | SpeckledDarth/musekit-cms                |

---

## Overview

Aligns the CMS codebase with the real Supabase database schema. The code previously used incorrect table names and referenced columns that don't exist.

### Real Database Schema

| Table              | Code Previously Used | Columns                                                                                    |
|--------------------|----------------------|--------------------------------------------------------------------------------------------|
| `posts`            | `content_posts`      | id, type, title, slug, excerpt, content, author_id, published (bool), published_at, created_at, updated_at |
| `waitlist_entries`  | `waitlist`           | id, email, created_at                                                                      |
| `feedback`         | `feedback`           | (correct — no changes)                                                                     |
| `settings`         | `brand_settings`     | id, key, value (no updated_at)                                                             |

### Key Column Differences

- **No `category` column** — code was using it for filtering and display
- **No `tags` column** — code was using it for badges and filtering
- **No `status` column** — real schema uses `published` (boolean), not `status` ("published"/"draft")
- **`type` column exists** — real schema has it; code was not using it. Now used by CustomPageEditor to distinguish pages from posts

---

## Changes Made

### FIX 1: Rename `content_posts` → `posts`

Replaced `.from("content_posts")` → `.from("posts")` in 7 files (11 occurrences):

| File                                    | Occurrences |
|-----------------------------------------|-------------|
| `src/blog/BlogAdmin.tsx`               | 5           |
| `src/blog/BlogList.tsx`                | 1           |
| `src/blog/BlogPost.tsx`               | 1           |
| `src/blog/ChangelogList.tsx`           | 1           |
| `src/custom-pages/CustomPageEditor.tsx`| 4           |
| `src/custom-pages/CustomPage.tsx`      | 1           |
| `src/landing/FeatureSubPage.tsx`       | 1           |

### FIX 2: Replace `status` (string) → `published` (boolean)

- All Post/PageData interfaces: removed `status: string`, added `published: boolean`
- All read queries: `.eq("status", "published")` → `.eq("published", true)`
- BlogAdmin insert: `status: "draft"` → `published: false`
- BlogAdmin toggle: uses `published: !post.published` instead of string comparison
- BlogAdmin display: `post.published` boolean instead of `post.status === "published"`
- CustomPageEditor insert: `status: "published"` → `published: true`

### FIX 3: Remove `category` and `tags` from all DB operations

- **BlogAdmin.tsx**: Removed `category`/`tags` from insert, update, Post interface, and list display. Removed `initialCategory`/`initialTags` props from BlogEditor calls.
- **BlogEditor.tsx**: Removed `initialCategory`, `initialTags` props. Removed category/tags form fields and state. Simplified `onSave` to `{ title: string; content: string }`.
- **BlogList.tsx**: Removed `selectedCategory` state, `.eq("category", ...)` filter, category filter buttons, and category display.
- **BlogPost.tsx**: Removed category and tags display from post view.
- **ChangelogList.tsx**: Reworked `getTagBadge()` and `matchesFilter()` to use the `type` column instead of category/tags.

### FIX 4: Fix hardcoded `author_id: "admin"`

- **BlogAdmin.tsx**: Added `userId?: string` prop. Uses `userId || "anonymous"` in insert.
- **CustomPageEditor.tsx**: Added `userId?: string` prop. Uses `userId || "anonymous"` in insert.
- `app/admin/page.tsx` can pass `userId` once auth is wired up.

### FIX 5: Rename `waitlist` → `waitlist_entries`

- `src/marketing/WaitlistForm.tsx`: `.from("waitlist")` → `.from("waitlist_entries")`
- `src/marketing/WaitlistAdmin.tsx`: `.from("waitlist")` → `.from("waitlist_entries")`

### FIX 6: CustomPageEditor uses `type` column

- Changed `.eq("category", "page")` → `.eq("type", "page")` for fetching pages
- Changed `category: "page"` → `type: "page"` in insert call

### FIX 7: All Post interfaces aligned with real schema

All interfaces now include: `id, type?, title, slug, excerpt?, content, author_id, published (boolean), published_at, created_at, updated_at?`

---

## LandingPageBuilder — No Changes Needed

`src/landing/LandingPageBuilder.tsx` does not reference `brand_settings` or the `settings` table. No changes were needed for FIX 5 from the original spec.

---

## Files Modified

| File                                    | Changes                                            |
|-----------------------------------------|----------------------------------------------------|
| `src/blog/BlogAdmin.tsx`               | Table rename, status→published, remove category/tags, author_id prop |
| `src/blog/BlogEditor.tsx`              | Remove category/tags props and form fields          |
| `src/blog/BlogList.tsx`                | Table rename, status→published, remove category filter |
| `src/blog/BlogPost.tsx`                | Table rename, status→published, remove category/tags display |
| `src/blog/ChangelogList.tsx`           | Table rename, status→published, use type instead of category/tags |
| `src/custom-pages/CustomPageEditor.tsx`| Table rename, status→published, type column, author_id prop |
| `src/custom-pages/CustomPage.tsx`      | Table rename, status→published                     |
| `src/landing/FeatureSubPage.tsx`       | Table rename, status→published                     |
| `src/marketing/WaitlistForm.tsx`       | Table rename (waitlist→waitlist_entries)            |
| `src/marketing/WaitlistAdmin.tsx`      | Table rename (waitlist→waitlist_entries)            |

---

## Acceptance Criteria

- [x] All queries use `posts` table (not `content_posts`)
- [x] All queries use `published` boolean (not `status` string)
- [x] No `category` or `tags` in any DB operations
- [x] No hardcoded `"admin"` as `author_id`
- [x] Waitlist queries use `waitlist_entries`
- [x] CustomPageEditor uses `type: "page"` instead of `category: "page"`
- [x] All Post interfaces match real DB columns
- [x] TypeScript compiles without errors (`npx next build`)
- [x] App runs correctly after changes

---

## Change Log

| Version | Date           | Author | Changes                          |
|---------|----------------|--------|----------------------------------|
| 2.0     | March 5, 2026  | Agent  | Implementation complete          |
