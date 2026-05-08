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
      <Image
        src={photo.storageUrl}
        alt={photo.title ?? ""}
        width={photo.width ?? 600}
        height={photo.height ?? 400}
        className="w-full h-auto transition-opacity duration-300 group-hover:opacity-90"
        sizes="(max-width: 768px) 100vw, 720px"
      />
    </Link>
  )
}
