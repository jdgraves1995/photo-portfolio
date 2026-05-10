# Admin Restyling & Return-to-Admin Nav Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the admin panel to match the public site's earthy palette and fonts, and add an auth-gated "Admin ↗" link to the public navbar so admins can return to the dashboard after using "View Site."

**Architecture:** Add a `--color-parchment` token to globals.css, then sweep admin files replacing dark-mode Tailwind classes with earthy equivalents. Separately, make `Navbar` an async server component that calls `auth()` internally and renders a conditional admin link — zero prop changes to any page.

**Tech Stack:** Next.js 16 App Router · Tailwind CSS 4 (CSS-variable tokens) · NextAuth v5

---

## File Map

| File | Change |
|---|---|
| `app/globals.css` | Add `--color-parchment: #eee9e1` token |
| `app/admin/layout.tsx` | Full dark→light restyle; brand name font |
| `app/admin/page.tsx` | Stat cards, action buttons, Playfair headings |
| `app/admin/upload/page.tsx` | Heading font, muted subtext |
| `app/admin/albums/page.tsx` | Heading font, album list items |
| `app/admin/photos/page.tsx` | Heading font |
| `components/admin/SignOutButton.tsx` | Text color |
| `components/admin/AlbumForm.tsx` | Inputs, labels, submit button |
| `components/admin/TagInput.tsx` | Container, chips, dropdown |
| `components/admin/UploadDropzone.tsx` | Labels, select, dropzone, progress items |
| `components/admin/DeleteablePhotoGrid.tsx` | Placeholder background |
| `components/admin/PhotoAlbumManager.tsx` | Dividers, text, select |
| `components/Navbar.tsx` | Make async, call `auth()`, add admin link |

---

## Task 1: Add parchment token + restyle admin shell

**Files:**
- Modify: `app/globals.css`
- Modify: `app/admin/layout.tsx`
- Modify: `components/admin/SignOutButton.tsx`

- [ ] **Step 1: Add parchment color token to globals.css**

In `app/globals.css`, add `--color-parchment: #eee9e1;` inside the `@theme inline` block, after the existing `--color-background` line:

```css
@import "tailwindcss";

@theme inline {
  /* public site palette */
  --color-canvas:     #f9f6f1;
  --color-ink:        #1c1c1a;
  --color-muted:      #8a8680;
  --color-rule:       #e8e4de;
  --color-sage:       #99ad7a;
  --color-background: #f9f6f1;
  --color-foreground: #1c1c1a;

  /* kept for admin panel */
  --color-parchment: #eee9e1;
  --color-mist:  #fff8ec;
  --color-navy:  #546b41;
  --color-steel: #99ad7a;
  --color-tan:   #dcccac;

  --font-sans:    var(--font-inter);
  --font-display: var(--font-playfair);
}
```

- [ ] **Step 2: Restyle app/admin/layout.tsx**

Replace the entire file content:

```tsx
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import SignOutButton from "@/components/admin/SignOutButton"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="min-h-screen bg-parchment text-ink">
      <nav className="border-b border-rule bg-parchment">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-display text-lg font-normal tracking-wide text-ink">
              JG Studio
            </Link>
            <span className="text-muted text-xs uppercase tracking-wide">Admin</span>
          </div>
          <div className="flex items-center gap-5 text-sm">
            <Link href="/admin" className="text-muted hover:text-ink transition-colors">
              Dashboard
            </Link>
            <Link href="/admin/upload" className="text-muted hover:text-ink transition-colors">
              Upload
            </Link>
            <Link href="/admin/albums" className="text-muted hover:text-ink transition-colors">
              Albums
            </Link>
            <Link href="/admin/photos" className="text-muted hover:text-ink transition-colors">
              Photos
            </Link>
            <SignOutButton />
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
```

- [ ] **Step 3: Restyle components/admin/SignOutButton.tsx**

Replace the entire file content:

```tsx
"use client"

import { signOut } from "next-auth/react"

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-muted hover:text-ink transition-colors"
    >
      Sign out
    </button>
  )
}
```

- [ ] **Step 4: Verify**

Run `npm run dev` and open `http://localhost:3000/admin`. Confirm:
- Page background is warm parchment (not dark green)
- Nav bar uses same parchment background with a thin border below
- "JG Studio" in Playfair Display, "Admin" badge in muted gray
- Nav links are muted gray, "Sign out" is muted gray

- [ ] **Step 5: Commit**

```bash
git add app/globals.css app/admin/layout.tsx components/admin/SignOutButton.tsx
git commit -m "style: restyle admin shell to earthy parchment palette"
```

---

## Task 2: Restyle admin page files

**Files:**
- Modify: `app/admin/page.tsx`
- Modify: `app/admin/upload/page.tsx`
- Modify: `app/admin/albums/page.tsx`
- Modify: `app/admin/photos/page.tsx`

- [ ] **Step 1: Replace app/admin/page.tsx**

```tsx
export const dynamic = "force-dynamic"

import { db } from "@/lib/db"
import Link from "next/link"
import DeleteablePhotoGrid from "@/components/admin/DeleteablePhotoGrid"

export default async function AdminPage() {
  const [photoCount, albumCount, recentPhotos] = await Promise.all([
    db.photo.count(),
    db.album.count(),
    db.photo.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ])

  return (
    <div>
      <h1 className="font-display text-2xl font-normal mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-rule rounded-xl p-6">
          <p className="text-muted text-sm">Total Photos</p>
          <p className="text-4xl font-bold mt-1 text-ink">{photoCount}</p>
        </div>
        <div className="bg-white border border-rule rounded-xl p-6">
          <p className="text-muted text-sm">Total Albums</p>
          <p className="text-4xl font-bold mt-1 text-ink">{albumCount}</p>
        </div>
      </div>

      <div className="flex gap-3 mb-8">
        <Link
          href="/admin/upload"
          className="bg-navy text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-navy/90 transition-colors"
        >
          Upload Photos
        </Link>
        <Link
          href="/admin/albums"
          className="border border-rule text-ink px-5 py-2.5 rounded-lg text-sm font-medium hover:border-muted transition-colors"
        >
          Manage Albums
        </Link>
        <Link
          href="/admin/photos"
          className="border border-rule text-ink px-5 py-2.5 rounded-lg text-sm font-medium hover:border-muted transition-colors"
        >
          Manage Photos
        </Link>
        <Link
          href="/"
          className="border border-rule text-ink px-5 py-2.5 rounded-lg text-sm font-medium hover:border-muted transition-colors"
        >
          View Site
        </Link>
      </div>

      {recentPhotos.length > 0 && (
        <div>
          <h2 className="font-display text-xl font-normal mb-3">Recent Uploads</h2>
          <DeleteablePhotoGrid photos={recentPhotos} />
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Replace app/admin/upload/page.tsx**

```tsx
export const dynamic = "force-dynamic"

import { db } from "@/lib/db"
import UploadDropzone from "@/components/admin/UploadDropzone"

export default async function UploadPage() {
  const [albums, tags] = await Promise.all([
    db.album.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
    db.tag.findMany({ orderBy: { name: "asc" } }),
  ])

  return (
    <div>
      <h1 className="font-display text-2xl font-normal mb-2">Upload Photos</h1>
      <p className="text-muted text-sm mb-8">
        JPEG, PNG, or WebP — export from Lightroom before uploading.
      </p>
      <UploadDropzone albums={albums} existingTags={tags} />
    </div>
  )
}
```

- [ ] **Step 3: Replace app/admin/albums/page.tsx**

```tsx
export const dynamic = "force-dynamic"

import { db } from "@/lib/db"
import AlbumForm from "@/components/admin/AlbumForm"
import Link from "next/link"

export default async function AdminAlbumsPage() {
  const albums = await db.album.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { photos: true } } },
  })

  return (
    <div>
      <h1 className="font-display text-2xl font-normal mb-6">Albums</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <h2 className="text-base font-semibold mb-4 text-ink">Create New Album</h2>
          <AlbumForm />
        </div>
        <div>
          <h2 className="text-base font-semibold mb-4 text-ink">
            Existing Albums ({albums.length})
          </h2>
          {albums.length === 0 ? (
            <p className="text-muted text-sm">No albums yet.</p>
          ) : (
            <ul className="space-y-2">
              {albums.map((album) => (
                <li
                  key={album.id}
                  className="bg-white border border-rule rounded-lg px-4 py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-ink text-sm font-medium">{album.title}</p>
                    <p className="text-muted text-xs mt-0.5">
                      {album._count.photos} photos &nbsp;·&nbsp; /{album.slug}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <Link
                      href={`/albums/${album.slug}`}
                      className="text-muted hover:text-ink transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Replace app/admin/photos/page.tsx**

```tsx
export const dynamic = "force-dynamic"

import { db } from "@/lib/db"
import PhotoAlbumManager from "@/components/admin/PhotoAlbumManager"

export default async function AdminPhotosPage() {
  const [photos, albums] = await Promise.all([
    db.photo.findMany({
      orderBy: { createdAt: "desc" },
      include: { album: { select: { id: true, title: true } } },
    }),
    db.album.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
  ])

  return (
    <div>
      <h1 className="font-display text-2xl font-normal mb-6">Photos</h1>
      <PhotoAlbumManager photos={photos} albums={albums} />
    </div>
  )
}
```

- [ ] **Step 5: Verify**

With `npm run dev` running, visit:
- `http://localhost:3000/admin` — stat cards white on parchment, sage green "Upload Photos" button, outline secondary buttons, Playfair heading
- `http://localhost:3000/admin/upload` — Playfair heading, muted subtext
- `http://localhost:3000/admin/albums` — Playfair heading, white album list items with rule borders
- `http://localhost:3000/admin/photos` — Playfair heading

- [ ] **Step 6: Commit**

```bash
git add app/admin/page.tsx app/admin/upload/page.tsx app/admin/albums/page.tsx app/admin/photos/page.tsx
git commit -m "style: apply earthy palette to admin page files"
```

---

## Task 3: Restyle AlbumForm

**Files:**
- Modify: `components/admin/AlbumForm.tsx`

- [ ] **Step 1: Replace components/admin/AlbumForm.tsx**

Only the JSX/className values change; all logic is identical:

```tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface AlbumFormProps {
  album?: {
    id: string
    title: string
    description: string | null
    slug: string
  }
}

export default function AlbumForm({ album }: AlbumFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(album?.title ?? "")
  const [description, setDescription] = useState(album?.description ?? "")
  const [slug, setSlug] = useState(album?.slug ?? "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const generateSlug = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!album) setSlug(generateSlug(value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      const method = album ? "PATCH" : "POST"
      const url = album ? `/api/albums/${album.slug}` : "/api/albums"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description: description || null, slug }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Failed to save album")
      }
      router.refresh()
      if (!album) {
        setTitle("")
        setDescription("")
        setSlug("")
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-muted mb-1">Title</label>
        <input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
          className="w-full bg-white border border-rule text-ink rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-navy"
          placeholder="My Album"
        />
      </div>
      <div>
        <label className="block text-sm text-muted mb-1">Slug (URL path)</label>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          pattern="[a-z0-9-]+"
          className="w-full bg-white border border-rule text-ink rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-navy"
          placeholder="my-album"
        />
      </div>
      <div>
        <label className="block text-sm text-muted mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full bg-white border border-rule text-ink rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-navy resize-none"
          placeholder="Optional description"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="bg-navy text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-navy/90 disabled:opacity-50 transition-colors"
      >
        {saving ? "Saving..." : album ? "Update Album" : "Create Album"}
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Verify**

Visit `http://localhost:3000/admin/albums`. Confirm the Create New Album form has white inputs with a thin border, muted labels, and a sage green submit button.

- [ ] **Step 3: Commit**

```bash
git add components/admin/AlbumForm.tsx
git commit -m "style: restyle AlbumForm inputs and submit button"
```

---

## Task 4: Restyle TagInput

**Files:**
- Modify: `components/admin/TagInput.tsx`

- [ ] **Step 1: Replace components/admin/TagInput.tsx**

All logic is unchanged; only className values change:

```tsx
"use client"

import { useState, useRef, useEffect } from "react"

interface Tag {
  id: string
  name: string
  slug: string
}

interface Props {
  existingTags: Tag[]
  selected: string[]
  onChange: (tags: string[]) => void
}

export default function TagInput({ existingTags, selected, onChange }: Props) {
  const [input, setInput] = useState("")
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const suggestions = existingTags.filter(
    (t) =>
      t.name.toLowerCase().includes(input.toLowerCase()) &&
      !selected.includes(t.name)
  )

  function add(name: string) {
    const trimmed = name.trim()
    if (!trimmed || selected.includes(trimmed)) return
    onChange([...selected, trimmed])
    setInput("")
    setOpen(false)
  }

  function remove(name: string) {
    onChange(selected.filter((t) => t !== name))
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      if (suggestions.length === 1) {
        add(suggestions[0].name)
      } else if (input.trim()) {
        add(input)
      }
    } else if (e.key === "Backspace" && !input && selected.length > 0) {
      remove(selected[selected.length - 1])
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <div className="flex flex-wrap gap-1.5 bg-white border border-rule rounded-lg px-3 py-2 min-h-[38px] focus-within:ring-1 focus-within:ring-navy/40">
        {selected.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-navy/10 text-ink text-xs rounded px-2 py-0.5"
          >
            {tag}
            <button
              type="button"
              onClick={() => remove(tag)}
              className="text-muted hover:text-ink leading-none"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={selected.length === 0 ? "Type a tag and press Enter" : ""}
          className="bg-transparent text-ink text-sm placeholder:text-muted outline-none min-w-[140px] flex-1"
        />
      </div>

      {open && (suggestions.length > 0 || (input.trim() && !existingTags.find((t) => t.name.toLowerCase() === input.trim().toLowerCase()))) && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-rule rounded-lg shadow-md overflow-hidden text-sm">
          {suggestions.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); add(t.name) }}
                className="w-full text-left px-3 py-2 text-ink hover:bg-canvas transition-colors"
              >
                {t.name}
              </button>
            </li>
          ))}
          {input.trim() && !existingTags.find((t) => t.name.toLowerCase() === input.trim().toLowerCase()) && (
            <li>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); add(input) }}
                className="w-full text-left px-3 py-2 text-muted hover:bg-canvas transition-colors"
              >
                Create &ldquo;{input.trim()}&rdquo;
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify**

Visit `http://localhost:3000/admin/upload`. Click the Tags field. Confirm:
- White container with thin rule border
- Sage green focus ring appears on focus
- Tag chips have a subtle green tint with ink text
- Dropdown (if tags exist) is white with rule border

- [ ] **Step 3: Commit**

```bash
git add components/admin/TagInput.tsx
git commit -m "style: restyle TagInput to earthy palette"
```

---

## Task 5: Restyle UploadDropzone

**Files:**
- Modify: `components/admin/UploadDropzone.tsx`

- [ ] **Step 1: Replace components/admin/UploadDropzone.tsx**

All upload logic is unchanged; only className values change:

```tsx
"use client"

import { useDropzone } from "react-dropzone"
import { useState, useCallback } from "react"
import TagInput from "@/components/admin/TagInput"

interface Album {
  id: string
  title: string
}

interface Tag {
  id: string
  name: string
  slug: string
}

interface UploadState {
  name: string
  status: "uploading" | "done" | "error"
  progress: number
  error?: string
}

async function getImageDimensions(file: File): Promise<{ width: number | null; height: number | null }> {
  const displayable = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]
  if (!displayable.includes(file.type)) return { width: null, height: null }
  return new Promise((resolve) => {
    const img = document.createElement("img")
    const url = URL.createObjectURL(file)
    img.onload = () => { resolve({ width: img.naturalWidth, height: img.naturalHeight }); URL.revokeObjectURL(url) }
    img.onerror = () => { resolve({ width: null, height: null }); URL.revokeObjectURL(url) }
    img.src = url
  })
}

export default function UploadDropzone({ albums, existingTags }: { albums: Album[]; existingTags: Tag[] }) {
  const [selectedAlbumId, setSelectedAlbumId] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [uploads, setUploads] = useState<UploadState[]>([])

  const updateUpload = useCallback((name: string, patch: Partial<UploadState>) => {
    setUploads((prev) => prev.map((u) => (u.name === name ? { ...u, ...patch } : u)))
  }, [])

  const uploadFile = useCallback(
    async (file: File) => {
      const signRes = await fetch("/api/upload/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type || "application/octet-stream" }),
      })
      if (!signRes.ok) throw new Error("Failed to get upload URL")
      const { uploadUrl, key, publicUrl } = await signRes.json()

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) updateUpload(file.name, { progress: Math.round((e.loaded / e.total) * 100) })
        }
        xhr.open("PUT", uploadUrl)
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream")
        xhr.onload = () => (xhr.status === 200 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`)))
        xhr.onerror = () => reject(new Error("Network error during upload"))
        xhr.send(file)
      })

      const { width, height } = await getImageDimensions(file)

      const saveRes = await fetch("/api/upload/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, publicUrl, originalFilename: file.name, width, height, albumId: selectedAlbumId || null, tagNames: selectedTags }),
      })
      if (!saveRes.ok) throw new Error("Failed to save photo")
    },
    [selectedAlbumId, selectedTags, updateUpload]
  )

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploads((prev) => [
        ...prev,
        ...acceptedFiles.map((f) => ({ name: f.name, status: "uploading" as const, progress: 0 })),
      ])
      for (const file of acceptedFiles) {
        try {
          await uploadFile(file)
          updateUpload(file.name, { status: "done", progress: 100 })
        } catch (err) {
          updateUpload(file.name, { status: "error", error: (err as Error).message })
        }
      }
    },
    [uploadFile, updateUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: true })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-6">
        {albums.length > 0 && (
          <div>
            <label className="block text-sm text-muted mb-1">Add to album (optional)</label>
            <select
              value={selectedAlbumId}
              onChange={(e) => setSelectedAlbumId(e.target.value)}
              className="bg-white border border-rule text-ink rounded-lg px-3 py-2 text-sm w-72 focus:outline-none focus:ring-1 focus:ring-navy/40"
            >
              <option value="">No album</option>
              {albums.map((a) => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex-1 min-w-[240px]">
          <label className="block text-sm text-muted mb-1">Tags (optional)</label>
          <TagInput existingTags={existingTags} selected={selectedTags} onChange={setSelectedTags} />
        </div>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-navy bg-navy/5" : "border-rule hover:border-muted"
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-ink text-lg">
          {isDragActive ? "Drop files here" : "Drag & drop photos here, or click to browse"}
        </p>
        <p className="text-muted text-sm mt-2">
          JPEG · PNG · WebP — export from Lightroom or Photos before uploading
        </p>
      </div>

      {uploads.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted">Upload progress</h3>
            <button onClick={() => setUploads([])} className="text-xs text-muted hover:text-ink transition-colors">Clear</button>
          </div>
          <ul className="space-y-3">
            {uploads.map((u, i) => (
              <li key={i} className="bg-white border border-rule rounded-lg px-4 py-3 text-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-ink truncate max-w-[70%]">{u.name}</span>
                  {u.status === "uploading" && <span className="text-muted text-xs">{u.progress}%</span>}
                  {u.status === "done" && <span className="text-navy text-xs">Done</span>}
                  {u.status === "error" && <span className="text-red-500 text-xs">{u.error ?? "Failed"}</span>}
                </div>
                {u.status === "uploading" && (
                  <div className="h-1 bg-rule rounded-full overflow-hidden">
                    <div className="h-full bg-navy rounded-full transition-all duration-300" style={{ width: `${u.progress}%` }} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify**

Visit `http://localhost:3000/admin/upload`. Confirm:
- Album select is white with rule border
- Dropzone has a dashed rule border, hover makes it slightly darker
- Drag-active state shifts to sage green border

- [ ] **Step 3: Commit**

```bash
git add components/admin/UploadDropzone.tsx
git commit -m "style: restyle UploadDropzone to earthy palette"
```

---

## Task 6: Restyle DeleteablePhotoGrid + PhotoAlbumManager

**Files:**
- Modify: `components/admin/DeleteablePhotoGrid.tsx`
- Modify: `components/admin/PhotoAlbumManager.tsx`

- [ ] **Step 1: Edit components/admin/DeleteablePhotoGrid.tsx**

Change only the placeholder background on the grid item. The dark delete overlay (`bg-black/70`) stays — it overlays a photo so dark-on-dark is correct.

Find the grid item `div` and change `bg-white/5` to `bg-rule`:

```tsx
<div
  key={photo.id}
  className="aspect-square rounded-lg overflow-hidden bg-rule relative cursor-pointer"
  onClick={() => setSelected(selected === photo.id ? null : photo.id)}
>
```

- [ ] **Step 2: Replace components/admin/PhotoAlbumManager.tsx**

All logic unchanged; className values updated:

```tsx
"use client"

import { useState } from "react"
import Image from "next/image"

interface Album {
  id: string
  title: string
}

interface Photo {
  id: string
  title: string | null
  storageUrl: string
  width: number | null
  height: number | null
  album: Album | null
}

interface Props {
  photos: Photo[]
  albums: Album[]
}

export default function PhotoAlbumManager({ photos, albums }: Props) {
  const [albumMap, setAlbumMap] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(photos.map((p) => [p.id, p.album?.id ?? null]))
  )
  const [savingId, setSavingId] = useState<string | null>(null)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

  async function handleAlbumChange(photoId: string, albumId: string | null) {
    setAlbumMap((prev) => ({ ...prev, [photoId]: albumId }))
    setSavingId(photoId)
    setSavedIds((prev) => { const next = new Set(prev); next.delete(photoId); return next })

    await fetch(`/api/photos/${photoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ albumId }),
    })

    setSavingId(null)
    setSavedIds((prev) => new Set(prev).add(photoId))
    setTimeout(() => {
      setSavedIds((prev) => { const next = new Set(prev); next.delete(photoId); return next })
    }, 2000)
  }

  if (photos.length === 0) {
    return <p className="text-muted text-sm">No photos uploaded yet.</p>
  }

  return (
    <div className="flex flex-col divide-y divide-rule">
      {photos.map((photo) => (
        <div key={photo.id} className="flex items-center gap-4 py-3">
          <div className="relative w-16 h-16 shrink-0 rounded overflow-hidden bg-rule">
            <Image
              src={photo.storageUrl}
              alt={photo.title ?? ""}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>

          <p className="flex-1 text-sm text-ink truncate">
            {photo.title ?? <span className="text-muted italic">Untitled</span>}
          </p>

          <div className="flex items-center gap-2 shrink-0">
            <select
              value={albumMap[photo.id] ?? ""}
              onChange={(e) => handleAlbumChange(photo.id, e.target.value || null)}
              className="bg-white border border-rule text-ink text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-muted"
            >
              <option value="">No album</option>
              {albums.map((album) => (
                <option key={album.id} value={album.id}>
                  {album.title}
                </option>
              ))}
            </select>

            <span className="w-4 text-sm text-center">
              {savingId === photo.id && <span className="text-muted">…</span>}
              {savedIds.has(photo.id) && <span className="text-sage">✓</span>}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Verify**

Visit `http://localhost:3000/admin` (recent uploads grid) and `http://localhost:3000/admin/photos`. Confirm:
- Photo thumbnail placeholders are the light rule color instead of a dark tint
- Photos page rows are separated by thin rule-colored dividers
- Album select dropdowns are white with rule border
- Save indicator "✓" appears in sage green after a change

- [ ] **Step 4: Commit**

```bash
git add components/admin/DeleteablePhotoGrid.tsx components/admin/PhotoAlbumManager.tsx
git commit -m "style: restyle photo grid and album manager components"
```

---

## Task 7: Add async auth + Admin link to public Navbar

**Files:**
- Modify: `components/Navbar.tsx`

- [ ] **Step 1: Replace components/Navbar.tsx**

Make the component `async`, import `auth`, and add the conditional admin link to both navbar variants:

```tsx
import Link from "next/link"
import { auth } from "@/lib/auth"

interface NavbarProps {
  transparent?: boolean
}

export default async function Navbar({ transparent = false }: NavbarProps) {
  const session = await auth()

  if (transparent) {
    return (
      <nav
        style={{ viewTransitionName: "site-header" }}
        className="absolute top-0 left-0 right-0 z-10 animate-[fadeIn_0.8s_ease-out_0.3s_both]"
      >
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-display text-lg font-normal tracking-wide text-white">
            JG Studio
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/gallery" className="text-sm text-white/80 hover:text-white transition-colors">
              Gallery
            </Link>
            <Link href="/albums" className="text-sm text-white/80 hover:text-white transition-colors">
              Albums
            </Link>
            {!!session && (
              <Link href="/admin" className="text-sm text-white/80 hover:text-white transition-colors">
                Admin ↗
              </Link>
            )}
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav style={{ viewTransitionName: "site-header" }} className="bg-canvas/95 backdrop-blur-sm border-b border-rule sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-display text-lg font-normal tracking-wide text-ink">
          JG Studio
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/gallery" className="text-sm text-muted hover:text-ink transition-colors">
            Gallery
          </Link>
          <Link href="/albums" className="text-sm text-muted hover:text-ink transition-colors">
            Albums
          </Link>
          {!!session && (
            <Link
              href="/admin"
              className="text-sm text-navy border border-navy rounded px-2 py-0.5 hover:bg-navy hover:text-white transition-colors"
            >
              Admin ↗
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Verify as logged-in admin**

With `npm run dev` running and logged in as admin:
- Visit `http://localhost:3000/albums` — confirm a sage green "Admin ↗" pill appears in the navbar alongside Gallery and Albums
- Visit `http://localhost:3000/` (hero page) — confirm "Admin ↗" appears in white text in the transparent navbar

- [ ] **Step 3: Verify as a logged-out user**

Open an incognito window and visit `http://localhost:3000/albums`. Confirm no "Admin ↗" link appears in the navbar.

- [ ] **Step 4: Commit**

```bash
git add components/Navbar.tsx
git commit -m "feat: show Admin link in public navbar for authenticated admins"
```

---

## Final check

Run `npm run lint` and `npx tsc --noEmit`. Both should pass with no errors before pushing.
