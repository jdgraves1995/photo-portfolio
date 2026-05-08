export const dynamic = "force-dynamic"

import { db } from "@/lib/db"
import GalleryScroll from "@/components/GalleryScroll"
import SiteMenu from "@/components/SiteMenu"
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

  const photos = album.coverPhotoId
    ? [
        ...album.photos.filter((p) => p.id === album.coverPhotoId),
        ...album.photos.filter((p) => p.id !== album.coverPhotoId),
      ]
    : album.photos

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-canvas text-ink">
      <SiteMenu />
      <div className="max-w-3xl w-full mx-auto px-6 pt-10 pb-4 shrink-0 animate-[fadeIn_0.8s_ease-out_both]">
        <Link href="/albums" className="text-sm text-muted hover:text-ink transition-colors">
          &larr; All albums
        </Link>
        <div className="mt-6">
          <h1 className="font-display text-3xl font-normal text-ink">{album.title}</h1>
          {album.description && (
            <p className="text-muted text-sm mt-2 italic leading-relaxed">{album.description}</p>
          )}
          <p className="text-muted text-xs mt-2">{album.photos.length} photos</p>
        </div>
      </div>

      {album.photos.length === 0 ? (
        <p className="text-muted text-sm text-center py-16">No photos in this album yet.</p>
      ) : (
        <GalleryScroll photos={photos} />
      )}
    </div>
  )
}
