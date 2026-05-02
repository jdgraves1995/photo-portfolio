"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import HeroCaptionEditor from "./HeroCaptionEditor"

interface Photo {
  id: string
  title: string | null
  storageUrl: string
  width: number | null
  height: number | null
}

interface Props {
  photos: Photo[]
  heroCaption?: string | null
  isAdmin: boolean
}

export default function PhotoSlideshow({ photos, heroCaption, isAdmin }: Props) {
  const [current, setCurrent] = useState(0)
  const [locked, setLocked] = useState(false)

  const go = useCallback(
    (dir: 1 | -1) => {
      if (locked) return
      const next = current + dir
      if (next < 0 || next >= photos.length) return
      setLocked(true)
      setCurrent(next)
      setTimeout(() => setLocked(false), 950)
    },
    [current, locked, photos.length]
  )

  const jumpTo = useCallback(
    (index: number) => {
      if (locked || index === current) return
      setLocked(true)
      setCurrent(index)
      setTimeout(() => setLocked(false), 950)
    },
    [current, locked]
  )

  // Wheel
  useEffect(() => {
    let lastFired = 0
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const now = Date.now()
      if (now - lastFired < 1000) return
      if (Math.abs(e.deltaY) < 30) return
      lastFired = now
      go(e.deltaY > 0 ? 1 : -1)
    }
    window.addEventListener("wheel", onWheel, { passive: false })
    return () => window.removeEventListener("wheel", onWheel)
  }, [go])

  // Touch
  const touchY = useRef(0)
  useEffect(() => {
    const onStart = (e: TouchEvent) => { touchY.current = e.touches[0].clientY }
    const onEnd = (e: TouchEvent) => {
      const delta = touchY.current - e.changedTouches[0].clientY
      if (Math.abs(delta) > 50) go(delta > 0 ? 1 : -1)
    }
    window.addEventListener("touchstart", onStart, { passive: true })
    window.addEventListener("touchend", onEnd)
    return () => {
      window.removeEventListener("touchstart", onStart)
      window.removeEventListener("touchend", onEnd)
    }
  }, [go])

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") go(1)
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") go(-1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [go])

  return (
    <div className="flex-1 relative overflow-hidden bg-mist">
      {/* Slides */}
      {photos.map((photo, i) => (
        <div
          key={photo.id}
          className="absolute inset-0 flex flex-col transition-transform duration-[900ms] ease-in-out"
          style={{ transform: `translateY(${(i - current) * 100}%)` }}
        >
          {/* Image area */}
          <div className="flex-1 relative min-h-0">
            <Link href={`/photos/${photo.id}`} className="block w-full h-full">
              <Image
                src={photo.storageUrl}
                alt={photo.title ?? ""}
                fill
                quality={100}
                className="object-contain p-6 lg:p-12"
                priority={i === 0}
                sizes="100vw"
              />
            </Link>
          </div>

          {/* Caption strip */}
          <div className="shrink-0 h-12 flex items-center justify-center px-16">
            {i === 0 ? (
              isAdmin ? (
                <HeroCaptionEditor caption={heroCaption} />
              ) : (
                heroCaption && (
                  <p className="text-navy/50 text-sm italic text-center">{heroCaption}</p>
                )
              )
            ) : (
              photo.title && (
                <p className="text-navy/50 text-sm italic text-center">{photo.title}</p>
              )
            )}
          </div>
        </div>
      ))}

      {/* Dot navigation */}
      {photos.length > 1 && photos.length <= 30 && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => jumpTo(i)}
              aria-label={`Photo ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "w-1.5 h-5 bg-navy"
                  : "w-1.5 h-1.5 bg-navy/25 hover:bg-navy/50"
              }`}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      {photos.length > 1 && (
        <div className="absolute bottom-3 right-4 text-navy/25 text-xs tabular-nums">
          {current + 1} / {photos.length}
        </div>
      )}

      {/* Scroll hint on first load */}
      {photos.length > 1 && current === 0 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-navy/25 animate-bounce pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      )}
    </div>
  )
}
