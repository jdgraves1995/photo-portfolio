"use client"

import { useState, useTransition } from "react"
import { updateHeroCaption } from "@/app/actions"

export default function HeroCaptionEditor({ caption }: { caption?: string | null }) {
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(caption ?? "")
  const [isPending, startTransition] = useTransition()

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="group text-center w-full"
      >
        {text ? (
          <p className="text-navy/60 text-lg leading-relaxed italic group-hover:text-navy/80 transition-colors">
            {text}
          </p>
        ) : (
          <p className="text-navy/30 text-base italic group-hover:text-navy/50 transition-colors">
            + Add a description for visitors
          </p>
        )}
        <span className="text-steel text-xs mt-1 block opacity-0 group-hover:opacity-100 transition-opacity">
          click to edit
        </span>
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
      className="flex flex-col items-center gap-3 w-full"
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Describe what the visitor is seeing..."
        className="w-full text-center text-lg text-navy leading-relaxed italic bg-white/60 border border-steel/30 focus:border-steel focus:outline-none rounded-lg resize-none py-3 px-4"
        rows={3}
        autoFocus
      />
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-1.5 bg-navy text-white text-sm rounded-lg hover:bg-steel transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => { setText(caption ?? ""); setIsEditing(false) }}
          className="px-5 py-1.5 text-navy/50 text-sm hover:text-navy transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
