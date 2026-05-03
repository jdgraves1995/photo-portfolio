import Image from "next/image"
import Link from "next/link"

interface Photo {
  id: string
  title: string | null
  storageUrl: string
  width: number | null
  height: number | null
}

interface Props {
  photos: Photo[]
  captionSlot?: React.ReactNode
  className?: string
}

export default function GalleryScroll({ photos, captionSlot, className = "py-16" }: Props) {
  return (
    <main className={`max-w-3xl mx-auto px-6 ${className}`}>
      {captionSlot && (
        <div className="flex justify-center mb-16">
          {captionSlot}
        </div>
      )}

      <div className="space-y-24">
        {photos.map((photo, i) => (
          <div key={photo.id}>
            <Link href={`/photos/${photo.id}`} className="block group">
              <Image
                src={photo.storageUrl}
                alt={photo.title ?? ""}
                width={photo.width ?? 1200}
                height={photo.height ?? 800}
                quality={100}
                priority={i === 0}
                className="w-full h-auto transition-opacity duration-300 group-hover:opacity-90"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </Link>
            {photo.title && (
              <p className="mt-4 text-center text-sm italic text-muted">
                {photo.title}
              </p>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}
