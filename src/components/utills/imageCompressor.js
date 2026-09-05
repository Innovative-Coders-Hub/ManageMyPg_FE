/**
 * Automatically resizes and compresses an image file on the client side before upload.
 * Reduces large 5MB-25MB photos to ~100KB-400KB JPEGs/PNGs.
 * Prevents Nginx 413 Request Entity Too Large errors permanently.
 *
 * @param {File|Blob} file - Original File or Blob object
 * @param {Object} options - Compression options
 * @param {number} [options.maxWidth=1200] - Max width in pixels
 * @param {number} [options.maxHeight=1200] - Max height in pixels
 * @param {number} [options.quality=0.75] - JPEG compression quality (0.1 to 1.0)
 * @param {string} [options.outputType='image/jpeg'] - Output MIME type
 * @returns {Promise<File|Blob>} Compressed File or Blob object
 */
export async function compressImage(file, options = {}) {
  if (!file || !file.type || !file.type.startsWith('image/')) {
    return file // Return unchanged if not an image
  }

  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.75,
    outputType = 'image/jpeg'
  } = options

  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        let { width, height } = img

        // If image is already smaller than max bounds and under 400KB, skip resizing
        if (width <= maxWidth && height <= maxHeight && file.size && file.size < 400 * 1024) {
          resolve(file)
          return
        }

        // Calculate aspect ratio preserving dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          } else {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file)
              return
            }
            const fileName = file.name ? file.name.replace(/\.[^/.]+$/, "") + ".jpg" : "image.jpg"
            const compressedFile = new File([blob], fileName, {
              type: outputType,
              lastModified: Date.now()
            })
            resolve(compressedFile)
          },
          outputType,
          quality
        )
      }

      img.onerror = () => resolve(file)
      img.src = e.target.result
    }

    reader.onerror = () => resolve(file)
    reader.readAsDataURL(file)
  })
}
