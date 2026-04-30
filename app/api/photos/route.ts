import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const albumId = searchParams.get("albumId")
  const cursor = searchParams.get("cursor")
  const limit = 24

  const photos = await db.photo.findMany({
    where: albumId ? { albumId } : undefined,
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
  })

  const hasMore = photos.length > limit
  if (hasMore) photos.pop()

  return NextResponse.json({
    photos,
    nextCursor: hasMore ? photos[photos.length - 1]?.id : null,
  })
}
