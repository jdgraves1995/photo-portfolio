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
      <h1 className="text-2xl font-bold mb-2">Upload Photos</h1>
      <p className="text-zinc-400 text-sm mb-8">
        JPEG, PNG, or WebP — export from Lightroom before uploading.
      </p>
      <UploadDropzone albums={albums} existingTags={tags} />
    </div>
  )
}
