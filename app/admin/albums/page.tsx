export const dynamic = "force-dynamic"

import { db } from "@/lib/db"
import AlbumForm from "@/components/admin/AlbumForm"
import Link from "next/link"

export default async function AdminAlbumsPage() {
  const albums = await db.album.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { photos: true } } },
  })

  return (
    <div>
      <h1 className="font-display text-2xl font-normal mb-6">Albums</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <h2 className="text-base font-semibold mb-4 text-ink">Create New Album</h2>
          <AlbumForm />
        </div>
        <div>
          <h2 className="text-base font-semibold mb-4 text-ink">
            Existing Albums ({albums.length})
          </h2>
          {albums.length === 0 ? (
            <p className="text-muted text-sm">No albums yet.</p>
          ) : (
            <ul className="space-y-2">
              {albums.map((album) => (
                <li
                  key={album.id}
                  className="bg-white border border-rule rounded-lg px-4 py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-ink text-sm font-medium">{album.title}</p>
                    <p className="text-muted text-xs mt-0.5">
                      {album._count.photos} photos &nbsp;·&nbsp; /{album.slug}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <Link
                      href={`/albums/${album.slug}`}
                      className="text-muted hover:text-ink transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
