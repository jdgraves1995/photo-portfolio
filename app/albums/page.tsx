export const dynamic = "force-dynamic"

import { db } from "@/lib/db"
import AlbumCard from "@/components/AlbumCard"
import SiteMenu from "@/components/SiteMenu"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Albums — Photography Portfolio",
}

export default async function AlbumsPage() {
  const raw = await db.album.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { photos: true } },
      coverPhoto: { select: { storageUrl: true } },
    },
  })

  const albums = raw.map((a) => ({
    ...a,
    coverPhotoUrl: a.coverPhoto?.storageUrl ?? null,
  }))

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <SiteMenu />
      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="font-display text-3xl font-normal text-ink mb-12 animate-[fadeIn_0.8s_ease-out_both]">Albums</h1>
        {albums.length === 0 ? (
          <p className="text-muted">No albums yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
