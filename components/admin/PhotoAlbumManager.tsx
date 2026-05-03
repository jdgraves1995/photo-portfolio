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
    return <p className="text-white/50 text-sm">No photos uploaded yet.</p>
  }

  return (
    <div className="flex flex-col divide-y divide-white/10">
      {photos.map((photo) => (
        <div key={photo.id} className="flex items-center gap-4 py-3">
          <div className="relative w-16 h-16 shrink-0 rounded overflow-hidden bg-white/5">
            <Image
              src={photo.storageUrl}
              alt={photo.title ?? ""}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>

          <p className="flex-1 text-sm text-white/80 truncate">
            {photo.title ?? <span className="text-white/30 italic">Untitled</span>}
          </p>

          <div className="flex items-center gap-2 shrink-0">
            <select
              value={albumMap[photo.id] ?? ""}
              onChange={(e) => handleAlbumChange(photo.id, e.target.value || null)}
              className="bg-white/10 border border-white/20 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-white/40"
            >
              <option value="">No album</option>
              {albums.map((album) => (
                <option key={album.id} value={album.id}>
                  {album.title}
                </option>
              ))}
            </select>

            <span className="w-4 text-sm text-center">
              {savingId === photo.id && <span className="text-white/40">…</span>}
              {savedIds.has(photo.id) && <span className="text-sage">✓</span>}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
