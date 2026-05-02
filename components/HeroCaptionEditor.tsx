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
          <p className="text-navy/50 text-sm italic group-hover:text-navy/70 transition-colors">
            {text}
          </p>
        ) : (
          <p className="text-navy/25 text-xs italic group-hover:text-navy/40 transition-colors">
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
        className="flex-1 text-center text-sm text-navy italic bg-white/70 border border-steel/30 focus:border-steel focus:outline-none rounded-lg py-1.5 px-3"
        autoFocus
      />
      <button
        type="submit"
        disabled={isPending}
        className="px-3 py-1.5 bg-navy text-white text-xs rounded-lg hover:bg-steel transition-colors disabled:opacity-50 shrink-0"
      >
        {isPending ? "…" : "Save"}
      </button>
      <button
        type="button"
        onClick={() => { setText(caption ?? ""); setIsEditing(false) }}
        className="text-navy/40 text-xs hover:text-navy transition-colors shrink-0"
      >
        Cancel
      </button>
    </form>
  )
}
