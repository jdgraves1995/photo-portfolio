export const dynamic = "force-dynamic"

import { db } from "@/lib/db"
import UploadDropzone from "@/components/admin/UploadDropzone"

export default async function UploadPage() {
  const [albums, tags] = await Promise.all([
    db.album.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
    db.tag.findMany({ orderBy: { name: "asc" } }),
  ])

  return (
    <div>
      <h1 className="font-display text-2xl font-normal mb-2">Upload Photos</h1>
      <p className="text-muted text-sm mb-8">
        JPEG, PNG, or WebP — export from Lightroom before uploading.
      </p>
      <UploadDropzone albums={albums} existingTags={tags} />
    </div>
  )
}
