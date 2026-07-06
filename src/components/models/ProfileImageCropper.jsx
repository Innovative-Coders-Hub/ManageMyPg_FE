import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Crop, CheckCircle2, Sliders } from 'lucide-react'

export default function ProfileImageCropper({ image, onCancel, onSave }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [processing, setProcessing] = useState(false)

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  async function handleSave() {
    setProcessing(true)
    try {
      const img = new Image()
      img.src = image
      await img.decode()

      const canvas = document.createElement('canvas')
      const MAX_DIM = 800
      const originalSize = Math.min(croppedAreaPixels.width, croppedAreaPixels.height)
      const size = Math.min(originalSize, MAX_DIM)

      canvas.width = size
      canvas.height = size

      const ctx = canvas.getContext('2d')
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

      let quality = 0.9
      let dataUrl = canvas.toDataURL('image/jpeg', quality)
      const MAX_B64_LENGTH = 1300000

      while (dataUrl.length > MAX_B64_LENGTH && quality > 0.1) {
        quality -= 0.1
        dataUrl = canvas.toDataURL('image/jpeg', quality)
      }

      onSave(dataUrl)
    } catch (err) {
      console.error('Error processing image:', err)
      alert('Failed to process image. Please try another one.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 relative border border-white/20"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-t-[2.5rem]" />

        <button
          onClick={onCancel}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors z-20"
        >
          <X size={20} strokeWidth={3} />
        </button>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
              <Crop size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                Adjust Profile Photo
              </h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                Center and zoom your image
              </p>
            </div>
          </div>

          <div className="relative h-72 bg-slate-900 rounded-3xl overflow-hidden ring-4 ring-slate-50 shadow-inner">
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

          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Sliders size={12} strokeWidth={3} />
                Zoom Level
              </span>
              <span className="text-[10px] font-black text-indigo-600">{(zoom * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={e => setZoom(e.target.value)}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onCancel}
              className="flex-1 h-[46px] bg-slate-50 border border-slate-200 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={processing}
              className="flex-[2] h-[46px] bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-40 shadow-lg shadow-slate-100 active:scale-95 flex items-center justify-center gap-2"
            >
              {processing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle2 size={16} />
              )}
              Apply Changes
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
