"use client"

import { useEffect, useRef, useState, useCallback } from "react"
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
}

export default function GalleryScroll({ photos }: Props) {
  const [current, setCurrent] = useState(0)
  const currentRef = useRef(0)
  const lockedRef = useRef(false)
  const touchStartY = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const goTo = useCallback((index: number) => {
    if (lockedRef.current || index < 0 || index >= photos.length) return
    lockedRef.current = true
    currentRef.current = index
    setCurrent(index)
    setTimeout(() => { lockedRef.current = false }, 950)
  }, [photos.length])

  // Wheel
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (Math.abs(e.deltaY) < 30) return
      goTo(currentRef.current + (e.deltaY > 0 ? 1 : -1))
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [goTo])

  // Touch
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onTouchStart = (e: TouchEvent) => { touchStartY.current = e.touches[0].clientY }
    const onTouchMove = (e: TouchEvent) => { e.preventDefault() }
    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartY.current === null) return
      const delta = touchStartY.current - e.changedTouches[0].clientY
      if (Math.abs(delta) > 50) goTo(currentRef.current + (delta > 0 ? 1 : -1))
      touchStartY.current = null
    }
    el.addEventListener("touchstart", onTouchStart, { passive: false })
    el.addEventListener("touchmove", onTouchMove, { passive: false })
    el.addEventListener("touchend", onTouchEnd)
    return () => {
      el.removeEventListener("touchstart", onTouchStart)
      el.removeEventListener("touchmove", onTouchMove)
      el.removeEventListener("touchend", onTouchEnd)
    }
  }, [goTo])

  // Keyboard
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") goTo(currentRef.current + 1)
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") goTo(currentRef.current - 1)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [goTo])

  return (
    <>
      <div ref={containerRef} className="flex-1 min-h-0 relative overflow-hidden touch-none overscroll-none">
        {photos.map((photo, i) => (
          <div
            key={photo.id}
            className={`absolute inset-0 flex flex-col items-center justify-center px-4 gap-4 transition-opacity duration-700 ease-in-out ${
              i === current ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="max-w-4xl w-full">
              <Link href={`/photos/${photo.id}`} className="block overflow-hidden rounded-2xl">
                <Image
                  src={photo.storageUrl}
                  alt={photo.title ?? ""}
                  width={photo.width ?? 1200}
                  height={photo.height ?? 800}
                  quality={100}
                  priority={i === 0}
                  className="w-full h-auto"
                  style={{ maxHeight: "85vh", objectFit: "contain" }}
                  sizes="(max-width: 768px) 100vw, 900px"
                />
              </Link>
              {photo.title && (
                <p className="mt-4 text-center text-sm italic text-muted">
                  {photo.title}
                </p>
              )}
            </div>
          </div>
        ))}

        <div className="absolute bottom-4 right-6 text-xs text-muted/50 tabular-nums pointer-events-none">
          {current + 1} / {photos.length}
        </div>
      </div>
    </>
  )
}
