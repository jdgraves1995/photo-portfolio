export const dynamic = "force-dynamic"

import { db } from "@/lib/db"
import PhotoAlbumManager from "@/components/admin/PhotoAlbumManager"

export default async function AdminPhotosPage() {
  const [photos, albums] = await Promise.all([
    db.photo.findMany({
      orderBy: { createdAt: "desc" },
      include: { album: { select: { id: true, title: true } } },
    }),
    db.album.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
  ])

  return (
    <div>
      <h1 className="font-display text-2xl font-normal mb-6">Photos</h1>
      <PhotoAlbumManager photos={photos} albums={albums} />
    </div>
  )
}
