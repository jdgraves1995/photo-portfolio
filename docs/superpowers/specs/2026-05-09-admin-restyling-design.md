# Admin Restyling & Return-to-Admin Nav

**Date:** 2026-05-09

## Overview

Two related changes:
1. Restyle the admin panel to match the public site's earthy palette and typography.
2. Add an "Admin ↗" link to the public navbar, visible only to authenticated admins, so they can return to the dashboard after using "View Site."

---

## 1. Admin Panel Restyling

### Palette

Replace the current dark green admin theme with a parchment variant of the public site palette:

| Role | Value | Token |
|---|---|---|
| Page background | `#eee9e1` | (one shade darker than `--color-canvas`) |
| Navbar background | `#eee9e1` | same as page bg |
| Navbar border | `#e8e4de` | `--color-rule` |
| Body text | `#1c1c1a` | `--color-ink` |
| Secondary / label text | `#8a8680` | `--color-muted` |
| Card / panel background | `#ffffff` | white |
| Card / panel border | `#e8e4de` | `--color-rule` |
| Primary action button bg | `#546b41` | `--color-navy` (sage green) |
| Primary action button text | `#ffffff` | white |
| Secondary button | transparent bg, `--color-rule` border, `--color-ink` text | |

### Typography

- Headings (`h1`, `h2` in admin pages): `font-display` (Playfair Display)
- All other text: Inter (default sans) — unchanged

### Files to update

- `app/admin/layout.tsx` — nav and page wrapper
- `app/admin/page.tsx` — stat cards, action buttons
- `app/admin/upload/page.tsx` — page heading and subtext
- `app/admin/albums/page.tsx` — album list items
- `app/admin/photos/page.tsx` — page heading
- `components/admin/SignOutButton.tsx` — button styling
- `components/admin/AlbumForm.tsx` — form inputs, labels, submit button
- `components/admin/DeleteablePhotoGrid.tsx` — grid and delete controls
- `components/admin/UploadDropzone.tsx` — dropzone area, form inputs
- `components/admin/PhotoAlbumManager.tsx` — photo list, selects
- `components/admin/TagInput.tsx` — tag chips and input

---

## 2. Public Nav "Admin ↗" Link

### Behavior

- `components/Navbar.tsx` becomes an `async` server component.
- It calls `auth()` internally.
- When a session exists, an "Admin ↗" link is appended to the nav links.
- Public visitors (no session) see no change — the link is never rendered for them.

### Styling

| Navbar variant | "Admin ↗" style |
|---|---|
| Solid (Gallery, Albums pages) | `text-navy border border-navy` pill — visually distinct from muted nav links |
| Transparent (hero/home page) | `text-white/80 hover:text-white` — matches other transparent nav links |

### Link target

`/admin` (the dashboard).

### What does NOT change

- The "View Site" link in `app/admin/page.tsx` — it remains as the outbound path to `/`.
- All page files that render `<Navbar />` — no prop changes needed.

---

## Out of scope

- Admin login page (`/login`) styling
- Adding auth to any other public pages
- Any new admin features or routes
