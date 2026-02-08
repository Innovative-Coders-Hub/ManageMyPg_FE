import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'

export default function ProfileImageCropper({ image, onCancel, onSave }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  async function handleSave() {
    const canvas = document.createElement('canvas')
    const img = new Image()
    img.src = image
    await img.decode()

    const size = Math.min(croppedAreaPixels.width, croppedAreaPixels.height)
    canvas.width = size
    canvas.height = size

    const ctx = canvas.getContext('2d')
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()

    ctx.drawImage(
      img,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      size,
      size
    )

    onSave(canvas.toDataURL('image/png'))
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-4 w-full max-w-sm">
        <div className="relative h-64 bg-gray-900 rounded-xl overflow-hidden">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={e => setZoom(e.target.value)}
          className="w-full mt-4"
        />

        <div className="flex gap-3 mt-4">
          <button onClick={onCancel} className="flex-1 py-2 rounded-xl border">
            Cancel
          </button>
          <button onClick={handleSave} className="flex-1 py-2 rounded-xl bg-indigo-600 text-white font-semibold">
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
