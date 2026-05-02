import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { key, publicUrl, originalFilename, width, height, albumId } = await req.json()

  if (!key || !publicUrl) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const photo = await db.photo.create({
    data: {
      storageKey: key,
      storageUrl: publicUrl,
      width: width ?? null,
      height: height ?? null,
      originalFilename: originalFilename ?? null,
      title: originalFilename ? originalFilename.replace(/\.[^.]+$/, "") : null,
      albumId: albumId || null,
    },
  })

  return NextResponse.json(photo)
}
