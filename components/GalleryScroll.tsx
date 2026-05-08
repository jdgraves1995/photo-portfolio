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
  const touchStartX = useRef<number | null>(null)
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
    const onTouchStart = (e: TouchEvent) => { touchStartX.current = e.touches[0].clientX }
    const onTouchMove = (e: TouchEvent) => { e.preventDefault() }
    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartX.current === null) return
      const delta = touchStartX.current - e.changedTouches[0].clientX
      if (Math.abs(delta) > 50) goTo(currentRef.current + (delta > 0 ? 1 : -1))
      touchStartX.current = null
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
      <div ref={containerRef} className="flex-1 min-h-0 relative overflow-hidden touch-none overscroll-none animate-[fadeIn_0.8s_ease-out_0.6s_both]">
        {photos.map((photo, i) => (
          <div
            key={photo.id}
            className={`absolute inset-0 flex flex-col items-center justify-center px-4 gap-4 transition-opacity duration-700 ease-in-out ${
              i === current ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="max-w-4xl w-full">
              <div className="relative overflow-hidden rounded-2xl">
                <Link href={`/photos/${photo.id}`} className="block">
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
                {photos.length > 1 && photos.length <= 25 && (
                  <div className="absolute bottom-3 left-3 flex flex-row items-center gap-1.5 z-10">
                    {photos.map((_, j) => (
                      <button
                        key={j}
                        onClick={() => goTo(j)}
                        aria-label={`Go to photo ${j + 1}`}
                        className={`rounded-full transition-all duration-300 ${
                          j === current
                            ? "w-5 h-1.5 bg-white/80"
                            : "w-1.5 h-1.5 bg-white/40 hover:bg-white/60"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

      </div>
    </>
  )
}
