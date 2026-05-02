import { auth } from "@/lib/auth"
import { r2, BUCKET, PUBLIC_URL } from "@/lib/r2"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { NextResponse } from "next/server"
import { randomUUID } from "crypto"

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { filename, contentType } = await req.json()
  const ext = filename.includes(".") ? filename.split(".").pop() : "bin"
  const key = `photos/${randomUUID()}.${ext}`

  const uploadUrl = await getSignedUrl(
    r2,
    new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }),
    { expiresIn: 3600 }
  )

  return NextResponse.json({ uploadUrl, key, publicUrl: `${PUBLIC_URL}/${key}` })
}
