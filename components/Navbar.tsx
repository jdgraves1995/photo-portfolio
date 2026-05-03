import Link from "next/link"

export default function Navbar() {
  return (
    <nav className="bg-canvas/95 backdrop-blur-sm border-b border-rule sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-display text-lg font-normal tracking-wide text-ink">
          Portfolio
        </Link>
        <Link href="/albums" className="text-sm text-muted hover:text-ink transition-colors">
          Albums
        </Link>
      </div>
    </nav>
  )
}
