# Sprint 2: Media Library & Dynamic Pages

**Version**: v1.0  
**Sprint**: 2 of 4  
**Scope**: Parts D (Media Library) and F (Dynamic Pages)

## Summary

Sprint 2 adds a full Media Library powered by Supabase Storage with upload, preview, copy URL, and delete capabilities. A reusable MediaPicker modal enables image insertion into any editor. The Custom Page Editor is enhanced with metadata fields (slug, excerpt, publish toggle), search, sortable columns, and bulk delete.

## New Components

### MediaLibrary (`src/media/MediaLibrary.tsx`) — NEW
- Grid view of uploaded images from Supabase Storage `media` bucket
- Search bar filters by filename (client-side)
- Drag-and-drop upload zone + Upload button
- File validation: images only (JPG, PNG, GIF, WebP, SVG), max 5MB
- Sanitized filenames with timestamp suffixes to prevent collisions
- Per-file actions: Preview (lightbox modal), Copy URL (clipboard), Delete (modal confirmation)
- Loading skeletons and empty state
- Optional `selectable` mode for use within MediaPicker

### MediaPicker (`src/media/MediaPicker.tsx`) — NEW
- Modal overlay showing the media grid in a selectable mode
- Search and inline upload within the modal
- Click to select an image, visual checkmark indicator
- Insert/Cancel footer buttons
- Props: `open`, `onClose`, `onSelect(url: string)`

## Components Modified

### BlogEditor (`src/blog/BlogEditor.tsx`)
- Added "Insert Image" toolbar button in the editor tab bar
- Opens MediaPicker modal; on selection, inserts `![image](url)` markdown at cursor position
- Textarea uses ref for cursor-aware insertion

### CustomPageEditor (`src/custom-pages/CustomPageEditor.tsx`)
- New metadata panel: editable slug field (auto-generated from title, customizable), excerpt/description textarea for SEO, published toggle switch
- Table layout with sortable column headers (Title, Slug, Status, Created) and sort indicators
- Search bar filtering by title or slug
- Checkbox column with select-all for bulk delete
- Bulk delete action bar with confirmation
- Clickable rows open edit form
- Published status badges (green/yellow)

### Admin Page (`app/admin/page.tsx`)
- Added "Media" tab between Changelog and Waitlist
- Renders MediaLibrary component

### Barrel Exports
- `src/media/index.ts` exports MediaLibrary and MediaPicker
- `src/index.ts` re-exports MediaLibrary and MediaPicker

## Infrastructure

| Resource | Details |
|---|---|
| Supabase Storage bucket | `media` — must be created in Supabase dashboard with public access enabled |
| File types allowed | image/jpeg, image/png, image/gif, image/webp, image/svg+xml |
| Max file size | 5 MB |

## Build Status

Clean build verified with `npx next build` — no TypeScript or compilation errors.

## Remaining Sprints

| Sprint | Scope |
|---|---|
| Sprint 3 | SEO Architecture (Part G) |
| Sprint 4 | Error Boundaries + UX Polish (Parts H, E) |

---

## Changelog

| Version | Date | Changes |
|---|---|---|
| v1.0 | 2026-03-05 | Sprint 2 delivery: MediaLibrary, MediaPicker, BlogEditor image insertion, CustomPageEditor metadata/search/sort/bulk |
| v1.1 | 2026-03-05 | Added onTitleChange callback to BlogEditor so CustomPageEditor slug auto-generation tracks title edits (code review finding) |
