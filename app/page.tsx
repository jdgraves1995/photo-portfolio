export const dynamic = "force-dynamic"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import PhotoSlideshow from "@/components/PhotoSlideshow"
import Navbar from "@/components/Navbar"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Photography Portfolio",
  description: "A collection of photographs.",
}

export default async function GalleryPage() {
  const [session, settings, photos] = await Promise.all([
    auth(),
    db.siteSettings.findUnique({ where: { id: "default" } }),
    db.photo.findMany({ orderBy: { createdAt: "desc" }, take: 48 }),
  ])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-mist">
      <Navbar />

      {photos.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-navy/30 gap-2">
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
        <PhotoSlideshow
          photos={photos}
          heroCaption={settings?.heroCaption}
          isAdmin={!!session}
        />
      )}
    </div>
  )
}
