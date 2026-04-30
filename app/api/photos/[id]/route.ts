import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
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
  await db.photo.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
