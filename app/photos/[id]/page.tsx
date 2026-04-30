export const dynamic = "force-dynamic"

import { db } from "@/lib/db"
import { fullUrl, ogImageUrl } from "@/lib/cloudinary"
import Navbar from "@/components/Navbar"
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
      images: [{ url: ogImageUrl(photo.cloudinaryPublicId), width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      images: [ogImageUrl(photo.cloudinaryPublicId)],
    },
  }
}

export default async function PhotoPage({ params }: Props) {
  const { id } = await params
  const photo = await db.photo.findUnique({
    where: { id },
    include: { album: true },
  })

  if (!photo) notFound()

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Link
          href={photo.album ? `/albums/${photo.album.slug}` : "/"}
          className="text-zinc-500 hover:text-white text-sm mb-6 inline-block transition-colors"
        >
          {photo.album ? `← ${photo.album.title}` : "← Gallery"}
        </Link>

        <div className="rounded-xl overflow-hidden bg-zinc-900">
          <Image
            src={fullUrl(photo.cloudinaryPublicId)}
            alt={photo.title ?? ""}
            width={photo.width ?? 1200}
            height={photo.height ?? 800}
            className="w-full h-auto"
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
        </div>

        {(photo.title || photo.description || photo.album) && (
          <div className="mt-6 space-y-1">
            {photo.title && (
              <h1 className="text-2xl font-semibold">{photo.title}</h1>
            )}
            {photo.album && (
              <Link
                href={`/albums/${photo.album.slug}`}
                className="text-zinc-400 hover:text-white text-sm transition-colors"
              >
                {photo.album.title}
              </Link>
            )}
            {photo.description && (
              <p className="text-zinc-300 leading-relaxed pt-2">{photo.description}</p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
