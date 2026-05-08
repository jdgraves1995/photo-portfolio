export const dynamic = "force-dynamic"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import Navbar from "@/components/Navbar"
import DeletePhotoButton from "@/components/admin/DeletePhotoButton"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const photo = await db.photo.findUnique({ where: { id } })
  if (!photo) return {}

  return {
    title: photo.title ?? "Photo — Portfolio",
    description: photo.description ?? undefined,
    openGraph: {
      title: photo.title ?? "Photo",
      description: photo.description ?? undefined,
      images: [{ url: photo.storageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      images: [photo.storageUrl],
    },
  }
}

export default async function PhotoPage({ params }: Props) {
  const { id } = await params
  const [photo, session] = await Promise.all([
    db.photo.findUnique({ where: { id }, include: { album: true, tags: { include: { tag: true } } } }),
    auth(),
  ])

  if (!photo) notFound()

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <Link
          href={photo.album ? `/albums/${photo.album.slug}` : "/"}
          className="text-muted hover:text-ink text-sm mb-8 inline-block transition-colors"
        >
          {photo.album ? `← ${photo.album.title}` : "← Gallery"}
        </Link>

        <Image
          src={photo.storageUrl}
          alt={photo.title ?? ""}
          width={photo.width ?? 1200}
          height={photo.height ?? 800}
          quality={100}
          className="w-full h-auto"
          priority
          sizes="(max-width: 1280px) 100vw, 1280px"
        />

        {(photo.title || photo.description || photo.album || photo.tags.length > 0) && (
          <div className="mt-6 text-center space-y-1">
            {photo.album && (
              <Link
                href={`/albums/${photo.album.slug}`}
                className="text-muted hover:text-ink text-sm transition-colors"
              >
                {photo.album.title}
              </Link>
            )}
            {photo.description && (
              <p className="text-muted leading-relaxed pt-2 italic text-sm">{photo.description}</p>
            )}
            {photo.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 pt-3">
                {photo.tags.map(({ tag }) => (
                  <span
                    key={tag.id}
                    className="text-xs bg-rule text-muted rounded-full px-3 py-1"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {session && (
          <div className="mt-8 flex justify-center">
            <DeletePhotoButton photoId={photo.id} />
          </div>
        )}
      </main>
    </div>
  )
}
