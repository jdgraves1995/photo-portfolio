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

const CHUNK_SIZE = 8 * 1024 * 1024 // 8MB — stays under Cloudinary's 10MB free-tier limit

async function uploadToCloudinary(
  file: File,
  signData: { signature: string; timestamp: number; folder: string; api_key: string; cloud_name: string },
  onProgress: (pct: number) => void
) {
  const uploadId = Math.random().toString(36).substring(2, 18)
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
  let result: Record<string, unknown> = {}

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE
    const end = Math.min(start + CHUNK_SIZE, file.size)
    const chunk = file.slice(start, end)

    const formData = new FormData()
    formData.append("file", chunk)
    formData.append("signature", signData.signature)
    formData.append("timestamp", String(signData.timestamp))
    formData.append("folder", signData.folder)
    formData.append("api_key", signData.api_key)

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${signData.cloud_name}/auto/upload`,
      {
        method: "POST",
        headers: {
          "X-Unique-Upload-Id": uploadId,
          "Content-Range": `bytes ${start}-${end - 1}/${file.size}`,
        },
        body: formData,
      }
    )

    result = await res.json()

    if (!res.ok && res.status !== 206) {
      throw new Error((result?.error as { message?: string })?.message ?? "Cloudinary upload failed")
    }

    onProgress(Math.round(((i + 1) / totalChunks) * 100))
  }

  return result
}

export default function UploadDropzone({ albums }: { albums: Album[] }) {
  const [selectedAlbumId, setSelectedAlbumId] = useState("")
  const [uploads, setUploads] = useState<UploadState[]>([])

  const updateUpload = useCallback((name: string, patch: Partial<UploadState>) => {
    setUploads((prev) => prev.map((u) => (u.name === name ? { ...u, ...patch } : u)))
  }, [])

  const uploadFile = useCallback(
    async (file: File) => {
      const signRes = await fetch("/api/upload/sign", { method: "POST" })
      if (!signRes.ok) throw new Error("Failed to get upload signature")
      const signData = await signRes.json()

      const result = await uploadToCloudinary(file, signData, (pct) => {
        updateUpload(file.name, { progress: pct })
      })

      const saveRes = await fetch("/api/upload/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_id: result.public_id,
          secure_url: result.secure_url,
          width: result.width,
          height: result.height,
          original_filename: result.original_filename,
          albumId: selectedAlbumId || null,
        }),
      })
      if (!saveRes.ok) throw new Error("Failed to save photo metadata")
    },
    [selectedAlbumId, updateUpload]
  )

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newUploads: UploadState[] = acceptedFiles.map((f) => ({
        name: f.name,
        status: "uploading",
        progress: 0,
      }))
      setUploads((prev) => [...prev, ...newUploads])

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  })

  return (
    <div className="space-y-6">
      {albums.length > 0 && (
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Add to album (optional)</label>
          <select
            value={selectedAlbumId}
            onChange={(e) => setSelectedAlbumId(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm w-72 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          >
            <option value="">No album</option>
            {albums.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-blue-500 bg-blue-500/5"
            : "border-zinc-700 hover:border-zinc-500"
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-zinc-300 text-lg">
          {isDragActive ? "Drop files here" : "Drag & drop photos here, or click to browse"}
        </p>
        <p className="text-zinc-500 text-sm mt-2">
          RAW: CR2, NEF, ARW, DNG, ORF &nbsp;·&nbsp; JPEG, PNG, TIFF, WebP
        </p>
      </div>

      {uploads.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-zinc-300">Upload progress</h3>
            <button
              onClick={() => setUploads([])}
              className="text-xs text-zinc-500 hover:text-white"
            >
              Clear
            </button>
          </div>
          <ul className="space-y-3">
            {uploads.map((u, i) => (
              <li key={i} className="bg-zinc-900 rounded-lg px-4 py-3 text-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-zinc-300 truncate max-w-[70%]">{u.name}</span>
                  {u.status === "uploading" && (
                    <span className="text-zinc-500 text-xs">{u.progress}%</span>
                  )}
                  {u.status === "done" && (
                    <span className="text-green-400 text-xs">Done</span>
                  )}
                  {u.status === "error" && (
                    <span className="text-red-400 text-xs">{u.error ?? "Failed"}</span>
                  )}
                </div>
                {u.status === "uploading" && (
                  <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${u.progress}%` }}
                    />
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
