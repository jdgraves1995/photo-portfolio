export const dynamic = "force-dynamic"

import { db } from "@/lib/db"
import AlbumCard from "@/components/AlbumCard"
import Navbar from "@/components/Navbar"
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
    <div className="min-h-screen bg-mist text-navy">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-semibold mb-8">Albums</h1>
        {albums.length === 0 ? (
          <p className="text-navy/40">No albums yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
