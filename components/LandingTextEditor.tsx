"use client"

import { useState, useTransition } from "react"
import { updateLandingText } from "@/app/actions"

interface Props {
  heading: string | null
  tagline: string | null
  isAdmin: boolean
}

export default function LandingTextEditor({ heading, tagline, isAdmin }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [headingText, setHeadingText] = useState(heading ?? "")
  const [taglineText, setTaglineText] = useState(tagline ?? "")
  const [isPending, startTransition] = useTransition()

  const hasContent = headingText || taglineText

  if (!hasContent && !isAdmin) return null

  if (!isEditing) {
    const display = (
      <div className="flex flex-col items-center gap-1">
        {headingText && (
          <h1 className="font-display text-2xl sm:text-3xl text-ink tracking-tight">
            {headingText}
          </h1>
        )}
        {taglineText && (
          <p className="text-sm italic text-muted">{taglineText}</p>
        )}
        {!hasContent && isAdmin && (
          <p className="text-muted/50 text-xs italic">
            + Add landing heading &amp; tagline (only you can see this)
          </p>
        )}
      </div>
    )

    if (isAdmin) {
      return (
        <button
          onClick={() => setIsEditing(true)}
          className="group w-full flex flex-col items-center justify-center py-2 animate-[fadeIn_0.8s_ease-out_both]"
        >
          {display}
        </button>
      )
    }

    return (
      <div className="flex flex-col items-center justify-center py-2 animate-[fadeIn_0.8s_ease-out_both]">
        {display}
      </div>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        startTransition(async () => {
          await updateLandingText(headingText, taglineText)
          setIsEditing(false)
        })
      }}
      className="flex flex-col items-center justify-center py-4 gap-2"
    >
      <div className="flex flex-col sm:flex-row gap-2 w-full max-w-lg">
        <input
          value={headingText}
          onChange={(e) => setHeadingText(e.target.value)}
          placeholder="Heading…"
          className="flex-1 text-center text-sm bg-canvas border border-rule focus:border-sage focus:outline-none rounded-lg py-1.5 px-3 text-ink font-display"
          autoFocus
        />
        <input
          value={taglineText}
          onChange={(e) => setTaglineText(e.target.value)}
          placeholder="Tagline…"
          className="flex-1 text-center text-sm italic bg-canvas border border-rule focus:border-sage focus:outline-none rounded-lg py-1.5 px-3 text-muted"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-3 py-1.5 bg-ink text-canvas text-xs rounded-lg hover:bg-sage transition-colors disabled:opacity-50"
        >
          {isPending ? "…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => {
            setHeadingText(heading ?? "")
            setTaglineText(tagline ?? "")
            setIsEditing(false)
          }}
          className="text-muted text-xs hover:text-ink transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
