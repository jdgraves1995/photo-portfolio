"use client"

import { useState, useRef, useEffect } from "react"

interface Tag {
  id: string
  name: string
  slug: string
}

interface Props {
  existingTags: Tag[]
  selected: string[]
  onChange: (tags: string[]) => void
}

export default function TagInput({ existingTags, selected, onChange }: Props) {
  const [input, setInput] = useState("")
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const suggestions = existingTags.filter(
    (t) =>
      t.name.toLowerCase().includes(input.toLowerCase()) &&
      !selected.includes(t.name)
  )

  function add(name: string) {
    const trimmed = name.trim()
    if (!trimmed || selected.includes(trimmed)) return
    onChange([...selected, trimmed])
    setInput("")
    setOpen(false)
  }

  function remove(name: string) {
    onChange(selected.filter((t) => t !== name))
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      if (suggestions.length === 1) {
        add(suggestions[0].name)
      } else if (input.trim()) {
        add(input)
      }
    } else if (e.key === "Backspace" && !input && selected.length > 0) {
      remove(selected[selected.length - 1])
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <div className="flex flex-wrap gap-1.5 bg-white/10 border border-white/20 rounded-lg px-3 py-2 min-h-[38px] focus-within:ring-1 focus-within:ring-white/30">
        {selected.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-steel/30 text-white text-xs rounded px-2 py-0.5"
          >
            {tag}
            <button
              type="button"
              onClick={() => remove(tag)}
              className="text-white/50 hover:text-white leading-none"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={selected.length === 0 ? "Type a tag and press Enter" : ""}
          className="bg-transparent text-white text-sm placeholder:text-white/30 outline-none min-w-[140px] flex-1"
        />
      </div>

      {open && (suggestions.length > 0 || (input.trim() && !existingTags.find((t) => t.name.toLowerCase() === input.trim().toLowerCase()))) && (
        <ul className="absolute z-10 mt-1 w-full bg-zinc-800 border border-white/10 rounded-lg shadow-lg overflow-hidden text-sm">
          {suggestions.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); add(t.name) }}
                className="w-full text-left px-3 py-2 text-white/80 hover:bg-white/10"
              >
                {t.name}
              </button>
            </li>
          ))}
          {input.trim() && !existingTags.find((t) => t.name.toLowerCase() === input.trim().toLowerCase()) && (
            <li>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); add(input) }}
                className="w-full text-left px-3 py-2 text-white/50 hover:bg-white/10"
              >
                Create &ldquo;{input.trim()}&rdquo;
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
