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
