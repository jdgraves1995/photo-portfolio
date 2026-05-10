import Link from "next/link"
import { auth } from "@/lib/auth"

interface NavbarProps {
  transparent?: boolean
}

export default async function Navbar({ transparent = false }: NavbarProps) {
  const session = await auth()

  if (transparent) {
    return (
      <nav
        style={{ viewTransitionName: "site-header" }}
        className="absolute top-0 left-0 right-0 z-10 animate-[fadeIn_0.8s_ease-out_0.3s_both]"
      >
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-display text-lg font-normal tracking-wide text-white">
            JG Studio
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/gallery" className="text-sm text-white/80 hover:text-white transition-colors">
              Gallery
            </Link>
            <Link href="/albums" className="text-sm text-white/80 hover:text-white transition-colors">
              Albums
            </Link>
            {!!session && (
              <Link href="/admin" className="text-sm text-white/80 hover:text-white transition-colors">
                Admin ↗
              </Link>
            )}
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav style={{ viewTransitionName: "site-header" }} className="bg-canvas/95 backdrop-blur-sm border-b border-rule sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-display text-lg font-normal tracking-wide text-ink">
          JG Studio
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/gallery" className="text-sm text-muted hover:text-ink transition-colors">
            Gallery
          </Link>
          <Link href="/albums" className="text-sm text-muted hover:text-ink transition-colors">
            Albums
          </Link>
          {!!session && (
            <Link
              href="/admin"
              className="text-sm text-navy border border-navy rounded px-2 py-0.5 hover:bg-navy hover:text-white transition-colors"
            >
              Admin ↗
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
