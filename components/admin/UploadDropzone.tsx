"use client"

import { useDropzone } from "react-dropzone"
import { useState, useCallback } from "react"
import TagInput from "@/components/admin/TagInput"

interface Album {
  id: string
  title: string
}

interface Tag {
  id: string
  name: string
  slug: string
}

interface UploadState {
  name: string
  status: "uploading" | "done" | "error"
  progress: number
  error?: string
}

async function getImageDimensions(file: File): Promise<{ width: number | null; height: number | null }> {
  const displayable = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]
  if (!displayable.includes(file.type)) return { width: null, height: null }
  return new Promise((resolve) => {
    const img = document.createElement("img")
    const url = URL.createObjectURL(file)
    img.onload = () => { resolve({ width: img.naturalWidth, height: img.naturalHeight }); URL.revokeObjectURL(url) }
    img.onerror = () => { resolve({ width: null, height: null }); URL.revokeObjectURL(url) }
    img.src = url
  })
}

export default function UploadDropzone({ albums, existingTags }: { albums: Album[]; existingTags: Tag[] }) {
  const [selectedAlbumId, setSelectedAlbumId] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [uploads, setUploads] = useState<UploadState[]>([])

  const updateUpload = useCallback((name: string, patch: Partial<UploadState>) => {
    setUploads((prev) => prev.map((u) => (u.name === name ? { ...u, ...patch } : u)))
  }, [])

  const uploadFile = useCallback(
    async (file: File) => {
      const signRes = await fetch("/api/upload/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type || "application/octet-stream" }),
      })
      if (!signRes.ok) throw new Error("Failed to get upload URL")
      const { uploadUrl, key, publicUrl } = await signRes.json()

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) updateUpload(file.name, { progress: Math.round((e.loaded / e.total) * 100) })
        }
        xhr.open("PUT", uploadUrl)
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream")
        xhr.onload = () => (xhr.status === 200 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`)))
        xhr.onerror = () => reject(new Error("Network error during upload"))
        xhr.send(file)
      })

      const { width, height } = await getImageDimensions(file)

      const saveRes = await fetch("/api/upload/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, publicUrl, originalFilename: file.name, width, height, albumId: selectedAlbumId || null, tagNames: selectedTags }),
      })
      if (!saveRes.ok) throw new Error("Failed to save photo")
    },
    [selectedAlbumId, selectedTags, updateUpload]
  )

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploads((prev) => [
        ...prev,
        ...acceptedFiles.map((f) => ({ name: f.name, status: "uploading" as const, progress: 0 })),
      ])
      for (const file of acceptedFiles) {
        try {
          await uploadFile(file)
          updateUpload(file.name, { status: "done", progress: 100 })
        } catch (err) {
          updateUpload(file.name, { status: "error", error: (err as Error).message })
        }
      }
    },
    [uploadFile, updateUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: true })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-6">
        {albums.length > 0 && (
          <div>
            <label className="block text-sm text-muted mb-1">Add to album (optional)</label>
            <select
              value={selectedAlbumId}
              onChange={(e) => setSelectedAlbumId(e.target.value)}
              className="bg-white border border-rule text-ink rounded-lg px-3 py-2 text-sm w-72 focus:outline-none focus:ring-1 focus:ring-navy/40"
            >
              <option value="">No album</option>
              {albums.map((a) => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex-1 min-w-[240px]">
          <label className="block text-sm text-muted mb-1">Tags (optional)</label>
          <TagInput existingTags={existingTags} selected={selectedTags} onChange={setSelectedTags} />
        </div>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-navy bg-navy/5" : "border-rule hover:border-muted"
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-ink text-lg">
          {isDragActive ? "Drop files here" : "Drag & drop photos here, or click to browse"}
        </p>
        <p className="text-muted text-sm mt-2">
          JPEG · PNG · WebP — export from Lightroom or Photos before uploading
        </p>
      </div>

      {uploads.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted">Upload progress</h3>
            <button onClick={() => setUploads([])} className="text-xs text-muted hover:text-ink transition-colors">Clear</button>
          </div>
          <ul className="space-y-3">
            {uploads.map((u, i) => (
              <li key={i} className="bg-white border border-rule rounded-lg px-4 py-3 text-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-ink truncate max-w-[70%]">{u.name}</span>
                  {u.status === "uploading" && <span className="text-muted text-xs">{u.progress}%</span>}
                  {u.status === "done" && <span className="text-navy text-xs">Done</span>}
                  {u.status === "error" && <span className="text-red-500 text-xs">{u.error ?? "Failed"}</span>}
                </div>
                {u.status === "uploading" && (
                  <div className="h-1 bg-rule rounded-full overflow-hidden">
                    <div className="h-full bg-navy rounded-full transition-all duration-300" style={{ width: `${u.progress}%` }} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
