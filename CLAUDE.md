# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev        # Start development server (localhost:3000)
npm run build      # Build for production
npm run lint       # Run ESLint
npx prisma migrate dev   # Run migrations against dev database
npx prisma studio        # Open Prisma GUI for database inspection
```

No test suite is configured.

## Architecture

Photography portfolio with a public gallery and a protected admin panel.

**Stack:** Next.js 16 App Router · React 19 · TypeScript · Tailwind CSS 4 · Prisma 7 + PostgreSQL (Supabase) · Cloudinary (image storage) · NextAuth v5 (GitHub OAuth)

**Path alias:** `@/*` maps to the project root.

### Data model (prisma/schema.prisma)

- `Photo` — Cloudinary asset (public_id, URL, dimensions, title, description)
- `Album` — Named collection of Photos, identified by slug, with an optional cover photo
- `Tag` / `PhotoTag` — Many-to-many tagging
- `SiteSettings` — Single-row table holding the hero photo and caption
- NextAuth tables — `User`, `Account`, `Session`, `VerificationToken`

Prisma client is generated to `app/generated/prisma/` (not the default location). The singleton client lives in `lib/db.ts` and uses `@prisma/adapter-pg` for the Supabase connection pool; `DIRECT_URL` is required for migrations.

### Request flow

```
Public visitors  →  /               (latest 48 photos, fullscreen slideshow)
                 →  /albums         (album grid)
                 →  /albums/[slug]  (album detail)

Admins           →  /login          (GitHub OAuth via NextAuth)
                 →  /admin          (dashboard: counts + recent uploads)
                 →  /admin/upload   (Cloudinary upload widget → /api/upload/sign → /api/upload/complete)
                 →  /admin/albums   (album CRUD)
```

All `/admin` routes are server-side protected via the NextAuth session check in their layouts. The upload flow uses a signed Cloudinary upload: the browser calls `/api/upload/sign` to get credentials, uploads directly to Cloudinary, then calls `/api/upload/complete` to persist the record in Postgres.

### Key files

| Path | Purpose |
|---|---|
| `lib/auth.ts` | NextAuth config (GitHub provider, session callbacks) |
| `lib/db.ts` | Prisma client singleton with PG adapter |
| `lib/cloudinary.ts` | URL builder helpers for image transformations |
| `app/actions.ts` | Server actions (e.g., `updateHeroCaption`) |
| `components/PhotoSlideshow.tsx` | Fullscreen gallery with scroll/swipe navigation |
| `app/globals.css` | Tailwind 4 theme — earthy palette: mist, navy, steel, tan |

### Environment variables

See `.env.example`. Required for dev:
- `DATABASE_URL` + `DIRECT_URL` (Supabase)
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`
- `NEXTAUTH_URL` (set to `http://localhost:3000` locally)
