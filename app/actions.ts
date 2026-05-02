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
