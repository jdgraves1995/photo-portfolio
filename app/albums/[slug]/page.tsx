export const dynamic = "force-dynamic"

import { db } from "@/lib/db"
import PhotoCard from "@/components/PhotoCard"
import Navbar from "@/components/Navbar"
import { notFound } from "next/navigation"
import { ogImageUrl } from "@/lib/cloudinary"
import Link from "next/link"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const album = await db.album.findUnique({ where: { slug } })
  if (!album) return {}

  return {
    title: `${album.title} — Photography Portfolio`,
    description: album.description ?? undefined,
    openGraph: {
      title: album.title,
      description: album.description ?? undefined,
      ...(album.coverPhotoId && {
        images: [{ url: ogImageUrl(album.coverPhotoId), width: 1200, height: 630 }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      ...(album.coverPhotoId && {
        images: [ogImageUrl(album.coverPhotoId)],
      }),
    },
  }
}

export default async function AlbumPage({ params }: Props) {
  const { slug } = await params
  const album = await db.album.findUnique({
    where: { slug },
    include: {
      photos: { orderBy: { createdAt: "desc" } },
    },
  })

  if (!album) notFound()

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/albums" className="text-zinc-500 hover:text-white text-sm mb-6 inline-block transition-colors">
          &larr; All albums
        </Link>
        <h1 className="text-3xl font-bold">{album.title}</h1>
        {album.description && (
          <p className="text-zinc-400 mt-2 max-w-2xl leading-relaxed">{album.description}</p>
        )}
        <p className="text-zinc-600 text-sm mt-2">{album.photos.length} photos</p>

        {album.photos.length === 0 ? (
          <p className="text-zinc-500 mt-12">No photos in this album yet.</p>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3 mt-8">
            {album.photos.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
