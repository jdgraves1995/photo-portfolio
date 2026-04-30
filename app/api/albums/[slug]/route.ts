import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

interface Props {
  params: Promise<{ slug: string }>
}

export async function GET(_req: NextRequest, { params }: Props) {
  const { slug } = await params

  const album = await db.album.findUnique({
    where: { slug },
    include: {
      photos: { orderBy: { createdAt: "desc" } },
      _count: { select: { photos: true } },
    },
  })

  if (!album) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(album)
}

export async function PATCH(req: NextRequest, { params }: Props) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { slug } = await params
  const body = await req.json()

  const album = await db.album.update({
    where: { slug },
    data: {
      title: body.title,
      description: body.description ?? null,
      slug: body.slug,
      coverPhotoId: body.coverPhotoId ?? null,
    },
  })

  return NextResponse.json(album)
}

export async function DELETE(_req: NextRequest, { params }: Props) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { slug } = await params
  await db.album.delete({ where: { slug } })
  return NextResponse.json({ ok: true })
}
