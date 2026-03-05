# Post-Sprint Fixes

**Version**: v1.0  
**Context**: Gaps identified during post-sprint-4 audit

## Summary

Addresses 4 gaps found after completing the 4-sprint improvement plan: admin authentication, "anonymous" author fallback, missing `/features` index page, and Supabase browser client singleton.

## Changes

### 1. Admin Authentication
- **`src/lib/auth.tsx`** — NEW: AuthProvider context using Supabase Auth with `signInWithPassword`, `onAuthStateChange` listener, and `useAuth()` hook
- **`src/admin/AdminAuthGate.tsx`** — NEW: Client component that shows a login form when unauthenticated, renders children + sign-out bar when authenticated
- **`app/admin/page.tsx`** — Wrapped in AdminAuthGate, passes `user.id` to BlogAdmin and CustomPageEditor
- **`app/layout.tsx`** — AuthProvider added as outermost client provider

**Setup**: Create admin users in the Supabase dashboard under Authentication > Users. Email/password auth must be enabled in Supabase Auth settings.

### 2. Author ID Fix
- **`src/blog/BlogAdmin.tsx`** — No longer falls back to "anonymous"; shows error toast if `userId` is missing
- **`src/custom-pages/CustomPageEditor.tsx`** — Same: explicit auth check before creating content

### 3. Features Index Page
- **`app/features/page.tsx`** — NEW: Server component listing all published feature posts from Supabase
- Card grid layout with title, description, and "Learn more" links to `/features/{slug}`
- `generateMetadata` for SEO
- Empty state with "Back to home" link
- Added `/features` to `app/sitemap.ts` static pages

### 4. Supabase Browser Client Singleton
- **`src/lib/supabase.ts`** — `getBrowserClient()` now returns a singleton, preventing "Multiple GoTrueClient instances" warnings

## Files

| File | Change |
|---|---|
| `src/lib/auth.tsx` | NEW — Auth context/hook |
| `src/admin/AdminAuthGate.tsx` | NEW — Login gate component |
| `src/admin/index.ts` | NEW — Module exports |
| `app/admin/page.tsx` | Auth gate + userId wiring |
| `app/layout.tsx` | AuthProvider added |
| `app/features/page.tsx` | NEW — Features index |
| `app/sitemap.ts` | Added /features to static pages |
| `src/lib/supabase.ts` | Browser client singleton |
| `src/blog/BlogAdmin.tsx` | Removed "anonymous" fallback |
| `src/custom-pages/CustomPageEditor.tsx` | Removed "anonymous" fallback |

---

## Changelog

| Version | Date | Changes |
|---|---|---|
| v1.0 | 2026-03-05 | Admin auth gate, author ID fix, features index page, Supabase client singleton |
