import Link from "next/link"
import Image from "next/image"
import { thumbUrl } from "@/lib/cloudinary"

interface Photo {
  id: string
  title: string | null
  cloudinaryPublicId: string
  width: number | null
  height: number | null
}

export default function PhotoCard({ photo }: { photo: Photo }) {
  return (
    <Link
      href={`/photos/${photo.id}`}
      className="block mb-3 group overflow-hidden rounded-lg"
    >
      <div className="relative overflow-hidden rounded-lg bg-zinc-900">
        <Image
          src={thumbUrl(photo.cloudinaryPublicId)}
          alt={photo.title ?? ""}
          width={photo.width ?? 600}
          height={photo.height ?? 400}
          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {photo.title && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
            <p className="text-white text-sm font-medium truncate">{photo.title}</p>
          </div>
        )}
      </div>
    </Link>
  )
}
