"use client"

import { signOut } from "next-auth/react"

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-muted hover:text-ink transition-colors"
    >
      Sign out
    </button>
  )
}
