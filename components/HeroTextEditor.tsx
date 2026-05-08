"use client"

import { useState, useTransition } from "react"
import { updateHeroText } from "@/app/actions"

interface Props {
  heading: string | null
  tagline: string | null
}

export default function HeroTextEditor({ heading, tagline }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [headingText, setHeadingText] = useState(heading ?? "")
  const [taglineText, setTaglineText] = useState(tagline ?? "")
  const [isPending, startTransition] = useTransition()

  const hasContent = headingText || taglineText

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="absolute inset-0 flex flex-col items-center justify-start pt-20 px-6 pointer-events-auto group"
      >
        {hasContent ? (
          <div className="flex flex-col items-center gap-2 animate-[fadeIn_0.8s_ease-out_0.6s_both]">
            {headingText && (
              <h1 className="font-display text-4xl sm:text-5xl font-normal text-white tracking-tight text-center drop-shadow-md">
                {headingText}
              </h1>
            )}
            {taglineText && (
              <p className="text-sm sm:text-base italic text-white/80 text-center drop-shadow-sm">
                {taglineText}
              </p>
            )}
          </div>
        ) : (
          <p className="text-white/40 text-xs italic group-hover:text-white/60 transition-colors">
            + Add heading &amp; tagline (only you can see this)
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
          await updateHeroText(headingText, taglineText)
          setIsEditing(false)
        })
      }}
      className="absolute inset-0 flex flex-col items-center justify-start pt-20 px-6 pointer-events-auto"
    >
      <div className="flex flex-col sm:flex-row gap-2 w-full max-w-lg">
        <input
          value={headingText}
          onChange={(e) => setHeadingText(e.target.value)}
          placeholder="Heading…"
          className="flex-1 text-center text-sm bg-black/40 border border-white/20 focus:border-white/60 focus:outline-none rounded-lg py-1.5 px-3 text-white font-display placeholder:text-white/40 backdrop-blur-sm"
          autoFocus
        />
        <input
          value={taglineText}
          onChange={(e) => setTaglineText(e.target.value)}
          placeholder="Tagline…"
          className="flex-1 text-center text-sm italic bg-black/40 border border-white/20 focus:border-white/60 focus:outline-none rounded-lg py-1.5 px-3 text-white/80 placeholder:text-white/40 backdrop-blur-sm"
        />
      </div>
      <div className="flex gap-2 mt-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs rounded-lg backdrop-blur-sm transition-colors disabled:opacity-50"
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
          className="text-white/50 text-xs hover:text-white/80 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
