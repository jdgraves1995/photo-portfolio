export const dynamic = "force-dynamic"

import { db } from "@/lib/db"
import Link from "next/link"
import DeleteablePhotoGrid from "@/components/admin/DeleteablePhotoGrid"

export default async function AdminPage() {
  const [photoCount, albumCount, recentPhotos] = await Promise.all([
    db.photo.count(),
    db.album.count(),
    db.photo.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ])

  return (
    <div>
      <h1 className="font-display text-2xl font-normal mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-rule rounded-xl p-6">
          <p className="text-muted text-sm">Total Photos</p>
          <p className="text-4xl font-bold mt-1 text-ink">{photoCount}</p>
        </div>
        <div className="bg-white border border-rule rounded-xl p-6">
          <p className="text-muted text-sm">Total Albums</p>
          <p className="text-4xl font-bold mt-1 text-ink">{albumCount}</p>
        </div>
      </div>

      <div className="flex gap-3 mb-8">
        <Link
          href="/admin/upload"
          className="bg-navy text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-navy/90 transition-colors"
        >
          Upload Photos
        </Link>
        <Link
          href="/admin/albums"
          className="border border-rule text-ink px-5 py-2.5 rounded-lg text-sm font-medium hover:border-muted transition-colors"
        >
          Manage Albums
        </Link>
        <Link
          href="/admin/photos"
          className="border border-rule text-ink px-5 py-2.5 rounded-lg text-sm font-medium hover:border-muted transition-colors"
        >
          Manage Photos
        </Link>
        <Link
          href="/"
          className="border border-rule text-ink px-5 py-2.5 rounded-lg text-sm font-medium hover:border-muted transition-colors"
        >
          View Site
        </Link>
      </div>

      {recentPhotos.length > 0 && (
        <div>
          <h2 className="font-display text-xl font-normal mb-3">Recent Uploads</h2>
          <DeleteablePhotoGrid photos={recentPhotos} />
        </div>
      )}
    </div>
  )
}
