"use client"

import { useDropzone } from "react-dropzone"
import { useState, useCallback } from "react"

interface Album {
  id: string
  title: string
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

export default function UploadDropzone({ albums }: { albums: Album[] }) {
  const [selectedAlbumId, setSelectedAlbumId] = useState("")
  const [uploads, setUploads] = useState<UploadState[]>([])

  const updateUpload = useCallback((name: string, patch: Partial<UploadState>) => {
    setUploads((prev) => prev.map((u) => (u.name === name ? { ...u, ...patch } : u)))
  }, [])

  const uploadFile = useCallback(
    async (file: File) => {
      // 1. Get presigned R2 URL
      const signRes = await fetch("/api/upload/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type || "application/octet-stream" }),
      })
      if (!signRes.ok) throw new Error("Failed to get upload URL")
      const { uploadUrl, key, publicUrl } = await signRes.json()

      // 2. PUT file directly to R2 with progress tracking
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

      // 3. Get image dimensions for web-displayable formats
      const { width, height } = await getImageDimensions(file)

      // 4. Save metadata to database
      const saveRes = await fetch("/api/upload/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, publicUrl, originalFilename: file.name, width, height, albumId: selectedAlbumId || null }),
      })
      if (!saveRes.ok) throw new Error("Failed to save photo")
    },
    [selectedAlbumId, updateUpload]
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
      {albums.length > 0 && (
        <div>
          <label className="block text-sm text-white/50 mb-1">Add to album (optional)</label>
          <select
            value={selectedAlbumId}
            onChange={(e) => setSelectedAlbumId(e.target.value)}
            className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-sm w-72 focus:outline-none focus:ring-1 focus:ring-white/30"
          >
            <option value="">No album</option>
            {albums.map((a) => (
              <option key={a.id} value={a.id}>{a.title}</option>
            ))}
          </select>
        </div>
      )}

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-steel bg-steel/5" : "border-white/20 hover:border-white/40"
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-white/70 text-lg">
          {isDragActive ? "Drop files here" : "Drag & drop photos here, or click to browse"}
        </p>
        <p className="text-white/30 text-sm mt-2">
          JPEG · PNG · WebP · RAW: CR2, NEF, ARW, DNG · No file size limit
        </p>
      </div>

      {uploads.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-white/50">Upload progress</h3>
            <button onClick={() => setUploads([])} className="text-xs text-white/30 hover:text-white">Clear</button>
          </div>
          <ul className="space-y-3">
            {uploads.map((u, i) => (
              <li key={i} className="bg-white/5 rounded-lg px-4 py-3 text-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white/70 truncate max-w-[70%]">{u.name}</span>
                  {u.status === "uploading" && <span className="text-white/30 text-xs">{u.progress}%</span>}
                  {u.status === "done" && <span className="text-steel text-xs">Done</span>}
                  {u.status === "error" && <span className="text-red-400 text-xs">{u.error ?? "Failed"}</span>}
                </div>
                {u.status === "uploading" && (
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-steel rounded-full transition-all duration-300" style={{ width: `${u.progress}%` }} />
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
