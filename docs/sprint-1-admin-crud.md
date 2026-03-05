# Sprint 1: Admin CRUD Enhancements

**Version**: v1.0  
**Sprint**: 1 of 4  
**Scope**: Parts A (Blog Admin), B (Waitlist Admin), C (Changelog Admin)

## Summary

Sprint 1 enhances the three admin CRUD interfaces — Blog, Waitlist, and Changelog — with search, filters, sorting, bulk actions, and full CRUD capabilities. A new `ChangelogAdmin` component was created, and `ChangelogList` was updated to query the dedicated `changelog_entries` table.

## Components Modified

### BlogAdmin (`src/blog/BlogAdmin.tsx`)
- Search bar: filters posts by title or content (client-side, live)
- Filter dropdowns: status (All/Published/Draft) and type (All/Blog/Changelog)
- Sortable column headers: Title, Status, Type, Created, Updated — click to toggle asc/desc with arrow indicators
- Clickable rows: cursor-pointer with hover state, opens BlogEditor
- Bulk actions: checkbox column with select-all, floating action bar with Publish/Unpublish/Delete buttons, confirmation dialogs

### WaitlistAdmin (`src/marketing/WaitlistAdmin.tsx`)
- Search bar: filters entries by email address (client-side)
- Sortable columns: Email and Signed Up date — click-to-sort with indicators
- Add Entry: green button opens inline form with email input, supports Enter key
- Per-row delete: trash icon with inline Confirm/Cancel confirmation
- Bulk delete: checkbox column with select-all, "Delete Selected" action bar with confirmation

### ChangelogAdmin (`src/blog/ChangelogAdmin.tsx`) — NEW
- Queries `changelog_entries` table
- List view: Title, Status (published/draft badges), Category (release/update/feature/fix with colored badges), Date
- Search bar: filters by title
- Category filter dropdown: All/Releases/Updates/Features/Fixes
- Sortable columns with click headers and sort indicators
- Full CRUD: create/edit with title input, markdown textarea (write/preview tabs), category selector; delete with confirmation; publish/unpublish toggle
- Clickable rows open inline editor

### ChangelogList (`src/blog/ChangelogList.tsx`)
- Updated to query `changelog_entries` table instead of `posts`
- Interface updated to match `changelog_entries` schema (category field instead of type)
- Category-based filtering and badge rendering using `category` column directly

### Admin Page (`app/admin/page.tsx`)
- Added "Changelog" tab between Blog and Waitlist tabs
- Renders `ChangelogAdmin` component

### Barrel Exports
- `ChangelogAdmin` exported from `src/blog/index.ts` and `src/index.ts`

## Database Tables Used

| Table | Operations |
|---|---|
| `posts` | SELECT, INSERT, UPDATE, DELETE (BlogAdmin) |
| `waitlist_entries` | SELECT, INSERT, DELETE (WaitlistAdmin) |
| `changelog_entries` | SELECT, INSERT, UPDATE, DELETE (ChangelogAdmin, ChangelogList) |

## Build Status

Clean build verified with `npx next build` — no TypeScript or compilation errors.

## Remaining Sprints

| Sprint | Scope |
|---|---|
| Sprint 2 | Media Library + Dynamic Pages (Parts D, F) |
| Sprint 3 | SEO Architecture (Part G) |
| Sprint 4 | Error Boundaries + UX Polish (Parts H, E) |

---

## Changelog

| Version | Date | Changes |
|---|---|---|
| v1.0 | 2026-03-05 | Initial Sprint 1 delivery: Blog search/filter/sort/bulk, Waitlist search/sort/add/delete/bulk, ChangelogAdmin CRUD, ChangelogList table migration |
| v1.1 | 2026-03-05 | Fixed BlogPost to fallback-query changelog_entries when slug not found in posts (code review finding) |
