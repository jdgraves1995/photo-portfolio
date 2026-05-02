import Link from "next/link"
import Image from "next/image"

interface Photo {
  id: string
  title: string | null
  storageUrl: string
  width: number | null
  height: number | null
}

export default function PhotoCard({ photo }: { photo: Photo }) {
  return (
    <Link href={`/photos/${photo.id}`} className="group block">
      <div className="overflow-hidden rounded-xl bg-white shadow-sm transition-shadow duration-300 group-hover:shadow-md">
        <Image
          src={photo.storageUrl}
          alt={photo.title ?? ""}
          width={photo.width ?? 600}
          height={photo.height ?? 400}
          className="w-full h-auto transition-transform duration-700 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 720px"
        />
      </div>
      {photo.title && (
        <p className="mt-3 text-navy/50 text-sm tracking-wide text-center">
          {photo.title}
        </p>
      )}
    </Link>
  )
}
