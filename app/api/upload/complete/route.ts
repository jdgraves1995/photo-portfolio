import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { public_id, secure_url, width, height, original_filename, albumId } = body

  if (!public_id || !secure_url) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const photo = await db.photo.create({
    data: {
      cloudinaryPublicId: public_id,
      cloudinaryUrl: secure_url,
      width: width ?? null,
      height: height ?? null,
      originalFilename: original_filename ?? null,
      title: original_filename ?? null,
      albumId: albumId || null,
    },
  })

  return NextResponse.json(photo)
}
