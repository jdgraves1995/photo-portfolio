import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

function slugify(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { key, publicUrl, originalFilename, width, height, albumId, tagNames } = await req.json()

  if (!key || !publicUrl) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const tags: string[] = Array.isArray(tagNames) ? tagNames : []

  const photo = await db.photo.create({
    data: {
      storageKey: key,
      storageUrl: publicUrl,
      width: width ?? null,
      height: height ?? null,
      originalFilename: originalFilename ?? null,
      title: originalFilename ? originalFilename.replace(/\.[^.]+$/, "") : null,
      albumId: albumId || null,
      tags: tags.length > 0 ? {
        create: tags.map((name) => ({
          tag: {
            connectOrCreate: {
              where: { slug: slugify(name) },
              create: { name: name.trim(), slug: slugify(name) },
            },
          },
        })),
      } : undefined,
    },
  })

  return NextResponse.json(photo)
}
