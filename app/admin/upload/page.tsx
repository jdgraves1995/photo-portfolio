export const dynamic = "force-dynamic"

import { db } from "@/lib/db"
import UploadDropzone from "@/components/admin/UploadDropzone"

export default async function UploadPage() {
  const albums = await db.album.findMany({
    orderBy: { title: "asc" },
    select: { id: true, title: true },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Upload Photos</h1>
      <p className="text-zinc-400 text-sm mb-8">
        RAW files are uploaded directly to Cloudinary and served as high-quality web images.
      </p>
      <UploadDropzone albums={albums} />
    </div>
  )
}
