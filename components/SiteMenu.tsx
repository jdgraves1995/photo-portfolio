"use client"

import { useState } from "react"
import Link from "next/link"

export default function SiteMenu() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Hamburger trigger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 right-6 z-30 p-2 text-muted hover:text-ink transition-colors"
        aria-label="Open menu"
      >
        <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
          <line x1="0" y1="1"  x2="22" y2="1"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="0" y1="7"  x2="22" y2="7"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="0" y1="13" x2="22" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Backdrop — click to dismiss */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-30 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Slide-in panel */}
      <div
        className={`fixed top-0 right-0 h-full w-72 z-40 bg-canvas/85 backdrop-blur-md border-l border-rule
          transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-6 p-2 text-muted hover:text-ink transition-colors"
          aria-label="Close menu"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <line x1="1" y1="1" x2="17" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="17" y1="1" x2="1"  y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Navigation */}
        <nav className="flex flex-col gap-8 px-8 pt-20">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="font-display text-2xl font-normal text-ink hover:text-muted transition-colors"
          >
            Home
          </Link>
          <Link
            href="/albums"
            onClick={() => setOpen(false)}
            className="font-display text-2xl font-normal text-ink hover:text-muted transition-colors"
          >
            Albums
          </Link>
        </nav>
      </div>
    </>
  )
}
