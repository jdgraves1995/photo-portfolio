"use client"

import { useState, useTransition } from "react"
import { updateHeroCaption } from "@/app/actions"

export default function HeroCaptionEditor({ caption }: { caption?: string | null }) {
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(caption ?? "")
  const [isPending, startTransition] = useTransition()

  if (!isEditing) {
    return (
      <button onClick={() => setIsEditing(true)} className="group text-center">
        {text ? (
          <p className="text-muted text-sm italic group-hover:text-ink transition-colors">
            {text}
          </p>
        ) : (
          <p className="text-muted/50 text-xs italic group-hover:text-muted transition-colors">
            + Add caption (only you can see this prompt)
          </p>
        )}
      </button>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        startTransition(async () => {
          await updateHeroCaption(text)
          setIsEditing(false)
        })
      }}
      className="flex items-center gap-2 w-full max-w-lg"
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Caption for visitors…"
        className="flex-1 text-center text-sm italic bg-canvas border border-rule focus:border-sage focus:outline-none rounded-lg py-1.5 px-3 text-ink"
        autoFocus
      />
      <button
        type="submit"
        disabled={isPending}
        className="px-3 py-1.5 bg-ink text-canvas text-xs rounded-lg hover:bg-sage transition-colors disabled:opacity-50 shrink-0"
      >
        {isPending ? "…" : "Save"}
      </button>
      <button
        type="button"
        onClick={() => { setText(caption ?? ""); setIsEditing(false) }}
        className="text-muted text-xs hover:text-ink transition-colors shrink-0"
      >
        Cancel
      </button>
    </form>
  )
}
