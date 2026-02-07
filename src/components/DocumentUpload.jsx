// src/components/DocumentUpload.jsx
import React from "react"

const MAX_FILE_SIZE = 1 * 1024 * 1024 // 1MB

const DOCUMENT_TYPES = [
  { key: "PHOTO", label: "Photo" },
  { key: "AADHAAR", label: "Aadhaar Card" },
  { key: "PAN", label: "PAN Card" },
  { key: "ID", label: "ID Card" }
]

// ---------- Image Compression Utility ----------
async function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = e => {
      img.src = e.target.result
    }

    img.onload = () => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      const scale = Math.min(800 / img.width, 800 / img.height, 1)
      canvas.width = img.width * scale
      canvas.height = img.height * scale

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      canvas.toBlob(
        blob => {
          if (!blob) reject()
          resolve(
            new File([blob], file.name, { type: "image/jpeg" })
          )
        },
        "image/jpeg",
        0.7 // quality (70%)
      )
    }

    reader.readAsDataURL(file)
  })
}

export default function DocumentUpload({ documents, setDocuments }) {

  const handleFileChange = async (type, file) => {
    if (!file) return

    // Case 1: Already small enough
    if (file.size <= MAX_FILE_SIZE) {
      setDocuments(prev => ({
        ...prev,
        [type]: file
      }))
      return
    }

    // Case 2: Image → auto compress
    if (file.type.startsWith("image/")) {
      try {
        const compressed = await compressImage(file)

        if (compressed.size > MAX_FILE_SIZE) {
          alert("Image is still larger than 1MB after compression")
          return
        }

        setDocuments(prev => ({
          ...prev,
          [type]: compressed
        }))
      } catch {
        alert("Failed to compress image")
      }
      return
    }

    // Case 3: PDF or others → reject
    alert("File must be less than 1MB")
  }

  const renderPreview = (file) => {
    if (!file) return null

    const isImage = file.type.startsWith("image/")
    const previewUrl = URL.createObjectURL(file)

    if (isImage) {
      return (
        <img
          src={previewUrl}
          alt="preview"
          className="w-16 h-16 object-cover rounded border cursor-pointer"
          onClick={() => window.open(previewUrl)}
        />
      )
    }

    return (
      <div
        className="flex items-center gap-2 text-blue-600 cursor-pointer"
        onClick={() => window.open(previewUrl)}
      >
        📄
        <span className="text-xs underline">
          {file.name}
        </span>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-4">
      <h2 className="text-lg font-semibold">📎 Upload Documents</h2>

      {DOCUMENT_TYPES.map(doc => (
        <div
          key={doc.key}
          className="flex items-center gap-4 border rounded-lg p-3"
        >
          <label className="w-32 text-sm font-medium">
            {doc.label}
          </label>

          <input
            type="file"
            accept="image/*,.pdf"
            onChange={e =>
              handleFileChange(doc.key, e.target.files[0])
            }
            className="block text-sm"
          />

          {documents?.[doc.key] && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              {renderPreview(documents[doc.key])}
              <span className="text-xs text-green-600">
                {(documents[doc.key].size / 1024).toFixed(1)} KB
              </span>
              <button
                type="button"
                onClick={() =>
                  setDocuments(prev => ({
                    ...prev,
                    [doc.key]: null
                  }))
                }
                className="text-xs text-red-500 hover:text-red-700 underline"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
