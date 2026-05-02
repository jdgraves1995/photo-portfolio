import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { r2, BUCKET } from "@/lib/r2"
import { DeleteObjectCommand } from "@aws-sdk/client-s3"
import { NextRequest, NextResponse } from "next/server"

interface Props {
  params: Promise<{ id: string }>
}

export async function PATCH(req: NextRequest, { params }: Props) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  const photo = await db.photo.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description,
      albumId: body.albumId ?? null,
    },
  })

  return NextResponse.json(photo)
}

export async function DELETE(_req: NextRequest, { params }: Props) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const photo = await db.photo.findUnique({ where: { id } })
  if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await Promise.all([
    db.album.updateMany({ where: { coverPhotoId: id }, data: { coverPhotoId: null } }),
    db.siteSettings.updateMany({ where: { heroPhotoId: id }, data: { heroPhotoId: null } }),
  ])

  await db.photo.delete({ where: { id } })
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: photo.storageKey }))

  return NextResponse.json({ ok: true })
}
