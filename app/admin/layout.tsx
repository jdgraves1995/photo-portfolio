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
    <div className="min-h-screen bg-zinc-950 text-white">
      <nav className="border-b border-zinc-800 bg-zinc-900">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-white font-bold">
              Portfolio
            </Link>
            <span className="text-zinc-600 text-xs">Admin</span>
          </div>
          <div className="flex items-center gap-5 text-sm">
            <Link href="/admin" className="text-zinc-400 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/admin/upload" className="text-zinc-400 hover:text-white transition-colors">
              Upload
            </Link>
            <Link href="/admin/albums" className="text-zinc-400 hover:text-white transition-colors">
              Albums
            </Link>
            <SignOutButton />
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
