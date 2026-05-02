import Link from "next/link"
import Image from "next/image"
import { thumbUrl } from "@/lib/cloudinary"

interface Album {
  id: string
  title: string
  description: string | null
  slug: string
  coverPhotoId: string | null
  _count?: { photos: number }
}

export default function AlbumCard({ album }: { album: Album }) {
  return (
    <Link
      href={`/albums/${album.slug}`}
      className="group block rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <div className="aspect-[4/3] overflow-hidden bg-mist">
        {album.coverPhotoId ? (
          <Image
            src={thumbUrl(album.coverPhotoId)}
            alt={album.title}
            width={600}
            height={400}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-navy/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-navy font-semibold text-lg leading-tight">{album.title}</h3>
        {album.description && (
          <p className="text-navy/50 text-sm mt-1 line-clamp-2">{album.description}</p>
        )}
        {album._count !== undefined && (
          <p className="text-steel text-xs mt-2">{album._count.photos} photos</p>
        )}
      </div>
    </Link>
  )
}
