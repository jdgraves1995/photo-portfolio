"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function DeletePhotoButton({ photoId }: { photoId: string }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setDeleting(true)
    const res = await fetch(`/api/photos/${photoId}`, { method: "DELETE" })
    if (res.ok) {
      router.push("/")
      router.refresh()
    } else {
      setDeleting(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-navy/60">Delete this photo?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
        >
          {deleting ? "Deleting…" : "Yes, delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-1.5 rounded-lg border border-navy/20 text-navy/60 text-sm hover:border-navy/40 transition-colors"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="px-3 py-1.5 rounded-lg border border-red-300 text-red-500 text-sm hover:bg-red-50 transition-colors"
    >
      Delete photo
    </button>
  )
}
