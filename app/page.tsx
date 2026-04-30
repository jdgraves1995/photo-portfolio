export const dynamic = "force-dynamic"

import { db } from "@/lib/db"
import PhotoCard from "@/components/PhotoCard"
import Navbar from "@/components/Navbar"

export const metadata = {
  title: "Photography Portfolio",
  description: "A collection of photographs.",
}

export default async function GalleryPage() {
  const photos = await db.photo.findMany({
    orderBy: { createdAt: "desc" },
    take: 48,
  })

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-600 gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">No photos yet</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3">
            {photos.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
