import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import SignOutButton from "@/components/admin/SignOutButton"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="min-h-screen bg-parchment text-ink">
      <nav className="border-b border-rule bg-parchment">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-display text-lg font-normal tracking-wide text-ink">
              JG Studio
            </Link>
            <span className="text-muted text-xs uppercase tracking-wide">Admin</span>
          </div>
          <div className="flex items-center gap-5 text-sm">
            <Link href="/admin" className="text-muted hover:text-ink transition-colors">
              Dashboard
            </Link>
            <Link href="/admin/upload" className="text-muted hover:text-ink transition-colors">
              Upload
            </Link>
            <Link href="/admin/albums" className="text-muted hover:text-ink transition-colors">
              Albums
            </Link>
            <Link href="/admin/photos" className="text-muted hover:text-ink transition-colors">
              Photos
            </Link>
            <SignOutButton />
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
