import Link from "next/link"

export default function Navbar() {
  return (
    <nav className="border-b border-zinc-800 bg-black sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-white font-bold text-xl tracking-tight">
          Portfolio
        </Link>
        <div className="flex items-center gap-6 text-sm text-zinc-400">
          <Link href="/" className="hover:text-white transition-colors">
            Gallery
          </Link>
          <Link href="/albums" className="hover:text-white transition-colors">
            Albums
          </Link>
        </div>
      </div>
    </nav>
  )
}
