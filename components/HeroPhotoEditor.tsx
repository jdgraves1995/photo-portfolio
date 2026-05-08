"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import { setHeroPhoto } from "@/app/actions"

interface PhotoItem {
  id: string
  storageUrl: string
  title: string | null
}

export default function HeroPhotoEditor({ currentPhotoId }: { currentPhotoId?: string }) {
  const [open, setOpen] = useState(false)
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [loading, setLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function openPicker() {
    setLoading(true)
    const all: PhotoItem[] = []
    let cursor: string | null = null
    do {
      const url = cursor ? `/api/photos?cursor=${cursor}` : "/api/photos"
      const data = await fetch(url).then((r) => r.json())
      all.push(...data.photos)
      cursor = data.nextCursor
    } while (cursor)
    setPhotos(all)
    setLoading(false)
    setOpen(true)
  }

  function select(id: string) {
    startTransition(async () => {
      await setHeroPhoto(id)
      setOpen(false)
    })
  }

  return (
    <>
      <button
        onClick={openPicker}
        disabled={loading}
        className="absolute bottom-6 right-6 z-20 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white text-xs rounded-full backdrop-blur-sm transition-colors disabled:opacity-50"
      >
        {loading ? "Loading…" : "Change photo"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="bg-canvas rounded-2xl max-w-3xl w-full max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-rule shrink-0">
              <h2 className="font-display text-lg text-ink">Choose hero photo</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-muted hover:text-ink transition-colors text-lg leading-none"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto p-5">
              {photos.length === 0 ? (
                <p className="text-center text-muted text-sm py-10">No photos found.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {photos.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => select(p.id)}
                      disabled={isPending}
                      className={`relative aspect-square rounded-lg overflow-hidden ring-2 transition-all disabled:opacity-60 ${
                        p.id === currentPhotoId
                          ? "ring-sage scale-[0.97]"
                          : "ring-transparent hover:ring-ink/30"
                      }`}
                    >
                      <Image
                        src={p.storageUrl}
                        alt={p.title ?? ""}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 33vw, 25vw"
                      />
                      {p.id === currentPhotoId && (
                        <div className="absolute inset-0 bg-sage/20 flex items-center justify-center">
                          <span className="bg-sage text-canvas text-[10px] font-medium px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
