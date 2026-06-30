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
    try {
      const img = new Image()
      img.src = image
      await img.decode()

      const canvas = document.createElement('canvas')
      // Limit max dimension to 800px - plenty for profile pictures
      const MAX_DIM = 800
      const originalSize = Math.min(croppedAreaPixels.width, croppedAreaPixels.height)
      const size = Math.min(originalSize, MAX_DIM)

      canvas.width = size
      canvas.height = size

      const ctx = canvas.getContext('2d')

      // Use a white background for JPEGs (otherwise transparent areas become black)
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, size, size)

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

      // Start with high quality JPEG
      let quality = 0.9
      let dataUrl = canvas.toDataURL('image/jpeg', quality)

      // Max size: 1048576 bytes. Base64 length is approx 1.33x binary size.
      // 1048576 * 1.33 = 1,394,606. We'll aim for 1,300,000 to be safe.
      const MAX_B64_LENGTH = 1300000

      while (dataUrl.length > MAX_B64_LENGTH && quality > 0.1) {
        quality -= 0.1
        dataUrl = canvas.toDataURL('image/jpeg', quality)
      }

      onSave(dataUrl)
    } catch (err) {
      console.error('Error processing image:', err)
      alert('Failed to process image. Please try another one.')
    }
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
