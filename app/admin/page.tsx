export const dynamic = "force-dynamic"

import { db } from "@/lib/db"
import Link from "next/link"
import { thumbUrl } from "@/lib/cloudinary"
import Image from "next/image"

export default async function AdminPage() {
  const [photoCount, albumCount, recentPhotos] = await Promise.all([
    db.photo.count(),
    db.album.count(),
    db.photo.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-zinc-900 rounded-xl p-6">
          <p className="text-zinc-400 text-sm">Total Photos</p>
          <p className="text-4xl font-bold mt-1">{photoCount}</p>
        </div>
        <div className="bg-zinc-900 rounded-xl p-6">
          <p className="text-zinc-400 text-sm">Total Albums</p>
          <p className="text-4xl font-bold mt-1">{albumCount}</p>
        </div>
      </div>

      <div className="flex gap-3 mb-8">
        <Link
          href="/admin/upload"
          className="bg-white text-black px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-100 transition-colors"
        >
          Upload Photos
        </Link>
        <Link
          href="/admin/albums"
          className="border border-zinc-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:border-zinc-500 transition-colors"
        >
          Manage Albums
        </Link>
        <Link
          href="/"
          className="border border-zinc-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:border-zinc-500 transition-colors"
        >
          View Site
        </Link>
      </div>

      {recentPhotos.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Recent Uploads</h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
            {recentPhotos.map((photo) => (
              <div key={photo.id} className="aspect-square rounded-lg overflow-hidden bg-zinc-900">
                <Image
                  src={thumbUrl(photo.cloudinaryPublicId)}
                  alt={photo.title ?? ""}
                  width={120}
                  height={120}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
