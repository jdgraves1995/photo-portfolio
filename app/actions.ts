"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function updateHeroCaption(caption: string) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  await db.siteSettings.upsert({
    where: { id: "default" },
    create: { id: "default", heroCaption: caption },
    update: { heroCaption: caption },
  })

  revalidatePath("/")
}

export async function setHeroPhoto(photoId: string) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  await db.siteSettings.upsert({
    where: { id: "default" },
    create: { id: "default", heroPhotoId: photoId },
    update: { heroPhotoId: photoId },
  })

  revalidatePath("/")
}

export async function updateHeroText(heading: string, tagline: string) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  await db.siteSettings.upsert({
    where: { id: "default" },
    create: { id: "default", heroHeading: heading, heroTagline: tagline },
    update: { heroHeading: heading, heroTagline: tagline },
  })

  revalidatePath("/")
}

export async function updateLandingText(heading: string, tagline: string) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  await db.siteSettings.upsert({
    where: { id: "default" },
    create: { id: "default", landingHeading: heading, landingTagline: tagline },
    update: { landingHeading: heading, landingTagline: tagline },
  })

  revalidatePath("/")
}
