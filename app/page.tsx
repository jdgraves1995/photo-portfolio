export const dynamic = "force-dynamic"

import { db } from "@/lib/db"
import Navbar from "@/components/Navbar"
import Image from "next/image"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Photography Portfolio",
  description: "A collection of photographs.",
}

export default async function HeroPage() {
  const [photo, settings] = await Promise.all([
    db.photo.findFirst({ orderBy: { createdAt: "desc" } }),
    db.siteSettings.findUnique({ where: { id: "default" } }),
  ])

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

      {(settings?.landingHeading || settings?.landingTagline) && (
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-20 px-6 pointer-events-none">
          <div className="flex flex-col items-center gap-2 animate-[fadeIn_0.8s_ease-out_0.6s_both]">
            {settings?.landingHeading && (
              <h1 className="font-display text-4xl sm:text-5xl font-normal text-white tracking-tight text-center drop-shadow-md">
                {settings.landingHeading}
              </h1>
            )}
            {settings?.landingTagline && (
              <p className="text-sm sm:text-base italic text-white/80 text-center drop-shadow-sm">
                {settings.landingTagline}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
