import Link from "next/link"

export default function Navbar() {
  return (
    <nav className="bg-navy sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-white font-semibold text-xl tracking-wide">
          Portfolio
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/" className="text-white/60 hover:text-white transition-colors">
            Gallery
          </Link>
          <Link href="/albums" className="text-white/60 hover:text-white transition-colors">
            Albums
          </Link>
        </div>
      </div>
    </nav>
  )
}
