export const dynamic = "force-dynamic"

import { db } from "@/lib/db"
import PhotoCard from "@/components/PhotoCard"
import Navbar from "@/components/Navbar"
import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const album = await db.album.findUnique({
    where: { slug },
    include: { coverPhoto: { select: { storageUrl: true } } },
  })
  if (!album) return {}

  return {
    title: `${album.title} — Photography Portfolio`,
    description: album.description ?? undefined,
    openGraph: {
      title: album.title,
      description: album.description ?? undefined,
      ...(album.coverPhoto && { images: [{ url: album.coverPhoto.storageUrl }] }),
    },
    twitter: {
      card: "summary_large_image",
      ...(album.coverPhoto && { images: [album.coverPhoto.storageUrl] }),
    },
  }
}

export default async function AlbumPage({ params }: Props) {
  const { slug } = await params
  const album = await db.album.findUnique({
    where: { slug },
    include: { photos: { orderBy: { createdAt: "desc" } } },
  })

  if (!album) notFound()

  return (
    <div className="min-h-screen bg-mist text-navy">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-10">
        <Link href="/albums" className="text-steel hover:text-navy text-sm mb-6 inline-block transition-colors">
          &larr; All albums
        </Link>
        <h1 className="text-3xl font-semibold">{album.title}</h1>
        {album.description && (
          <p className="text-navy/60 mt-2 max-w-2xl leading-relaxed">{album.description}</p>
        )}
        <p className="text-navy/30 text-sm mt-2">{album.photos.length} photos</p>

        {album.photos.length === 0 ? (
          <p className="text-navy/40 mt-12">No photos in this album yet.</p>
        ) : (
          <div className="max-w-2xl mx-auto mt-12 space-y-20">
            {album.photos.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
