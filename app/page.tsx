export const dynamic = "force-dynamic"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { fullUrl } from "@/lib/cloudinary"
import PhotoCard from "@/components/PhotoCard"
import HeroCaptionEditor from "@/components/HeroCaptionEditor"
import Navbar from "@/components/Navbar"
import Image from "next/image"
import Link from "next/link"
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

  const isAdmin = !!session

  const heroPhoto = settings?.heroPhotoId
    ? (photos.find((p) => p.id === settings.heroPhotoId) ?? photos[0])
    : photos[0]

  const galleryPhotos = heroPhoto
    ? photos.filter((p) => p.id !== heroPhoto.id)
    : photos

  return (
    <div className="min-h-screen bg-mist text-navy">
      <Navbar />

      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-navy/30 gap-2">
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
        <>
          {/* Hero */}
          {heroPhoto && (
            <section className="px-6 pt-10 pb-8">
              <div className="max-w-5xl mx-auto">
                <Link
                  href={`/photos/${heroPhoto.id}`}
                  className="block overflow-hidden rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <Image
                    src={fullUrl(heroPhoto.cloudinaryPublicId)}
                    alt={heroPhoto.title ?? "Featured photo"}
                    width={heroPhoto.width ?? 1500}
                    height={heroPhoto.height ?? 1000}
                    className="w-full h-auto"
                    priority
                    sizes="(max-width: 1280px) 100vw, 1280px"
                  />
                </Link>

                <div className="mt-6 max-w-2xl mx-auto text-center">
                  {isAdmin ? (
                    <HeroCaptionEditor caption={settings?.heroCaption} />
                  ) : (
                    settings?.heroCaption && (
                      <p className="text-navy/60 text-lg leading-relaxed italic">
                        {settings.heroCaption}
                      </p>
                    )
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Gallery scroll */}
          {galleryPhotos.length > 0 && (
            <section className="border-t border-navy/10 py-16 px-6">
              <div className="max-w-2xl mx-auto space-y-20">
                {galleryPhotos.map((photo) => (
                  <PhotoCard key={photo.id} photo={photo} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
