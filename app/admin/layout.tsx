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
    <div className="min-h-screen bg-[#3a4d2a] text-white">
      <nav className="border-b border-white/10 bg-navy">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-white font-bold">
              Portfolio
            </Link>
            <span className="text-white/30 text-xs">Admin</span>
          </div>
          <div className="flex items-center gap-5 text-sm">
            <Link href="/admin" className="text-white/60 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/admin/upload" className="text-white/60 hover:text-white transition-colors">
              Upload
            </Link>
            <Link href="/admin/albums" className="text-white/60 hover:text-white transition-colors">
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
