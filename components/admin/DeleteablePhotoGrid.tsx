"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface Photo {
  id: string
  storageUrl: string
  title: string | null
}

export default function DeleteablePhotoGrid({ photos }: { photos: Photo[] }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete(id: string) {
    setDeleting(true)
    const res = await fetch(`/api/photos/${id}`, { method: "DELETE" })
    if (res.ok) {
      setSelected(null)
      router.refresh()
    }
    setDeleting(false)
  }

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="aspect-square rounded-lg overflow-hidden bg-white/5 relative cursor-pointer"
          onClick={() => setSelected(selected === photo.id ? null : photo.id)}
        >
          <Image
            src={photo.storageUrl}
            alt={photo.title ?? ""}
            width={120}
            height={120}
            className="w-full h-full object-cover"
          />

          {selected === photo.id && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 p-2">
              <p className="text-white text-xs text-center font-medium">Delete photo?</p>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(photo.id) }}
                disabled={deleting}
                className="w-full px-2 py-1 rounded bg-red-500 text-white text-xs font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setSelected(null) }}
                className="w-full px-2 py-1 rounded bg-white/20 text-white text-xs hover:bg-white/30 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
