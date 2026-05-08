export const dynamic = "force-dynamic"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import Navbar from "@/components/Navbar"
import HeroPhotoEditor from "@/components/HeroPhotoEditor"
import HeroTextEditor from "@/components/HeroTextEditor"
import Image from "next/image"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Photography Portfolio",
  description: "A collection of photographs.",
}

export default async function HeroPage() {
  const [latestPhoto, settings, session] = await Promise.all([
    db.photo.findFirst({ orderBy: { createdAt: "desc" } }),
    db.siteSettings.findUnique({ where: { id: "default" } }),
    auth(),
  ])

  const photo = settings?.heroPhotoId
    ? ((await db.photo.findUnique({ where: { id: settings.heroPhotoId } })) ?? latestPhoto)
    : latestPhoto

  if (!photo) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas text-muted">
        <p className="text-sm">No photos yet</p>
      </div>
    )
  }

  return (
    <div className="relative h-screen overflow-hidden">
      <Image
        src={photo.storageUrl}
        alt={photo.title ?? ""}
        fill
        quality={100}
        className="object-cover"
        priority
        sizes="100vw"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50 pointer-events-none" />

      <Navbar transparent />

      {!!session ? (
        <HeroTextEditor
          heading={settings?.heroHeading ?? null}
          tagline={settings?.heroTagline ?? null}
        />
      ) : (settings?.heroHeading || settings?.heroTagline) ? (
        <div className="absolute inset-0 flex flex-col items-center justify-start pt-20 px-6 pointer-events-none">
          <div className="flex flex-col items-center gap-2 animate-[fadeIn_0.8s_ease-out_0.6s_both]">
            {settings.heroHeading && (
              <h1 className="font-display text-4xl sm:text-5xl font-normal text-white tracking-tight text-center drop-shadow-md">
                {settings.heroHeading}
              </h1>
            )}
            {settings.heroTagline && (
              <p className="text-sm sm:text-base italic text-white/80 text-center drop-shadow-sm">
                {settings.heroTagline}
              </p>
            )}
          </div>
        </div>
      ) : null}

      {!!session && <HeroPhotoEditor currentPhotoId={photo.id} />}
    </div>
  )
}
