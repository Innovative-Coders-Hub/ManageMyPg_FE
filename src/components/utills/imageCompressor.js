/**
 * Automatically resizes and compresses an image file on the client side before upload.
 * Reduces large 5MB-25MB photos to ~100KB-400KB JPEGs.
 * Sanitizes and truncates file names to short clean identifiers to prevent backend filename path length errors.
 *
 * @param {File|Blob} file - Original File or Blob object
 * @param {Object} options - Compression options
 * @param {number} [options.maxWidth=1200] - Max width in pixels
 * @param {number} [options.maxHeight=1200] - Max height in pixels
 * @param {number} [options.quality=0.75] - JPEG compression quality (0.1 to 1.0)
 * @param {string} [options.outputType='image/jpeg'] - Output MIME type
 * @param {string} [options.fileName] - Custom short file name (e.g., 'promo_banner.jpg')
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
    outputType = 'image/jpeg',
    fileName = null
  } = options

  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        let { width, height } = img

        // If image is already smaller than max bounds and under 400KB, sanitize filename and return
        if (width <= maxWidth && height <= maxHeight && file.size && file.size < 400 * 1024) {
          const cleanName = fileName || (file.name
            ? file.name.replace(/\.[^/.]+$/, "").substring(0, 15).replace(/[^a-zA-Z0-9_-]/g, "_") + ".jpg"
            : "image.jpg")
          const renamedFile = new File([file], cleanName, { type: file.type, lastModified: Date.now() })
          resolve(renamedFile)
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

            // Create a short, clean, safe filename (e.g. promo_banner.jpg or category_banner.jpg)
            let cleanName = fileName
            if (!cleanName) {
              const baseName = file.name
                ? file.name.replace(/\.[^/.]+$/, "").substring(0, 15).replace(/[^a-zA-Z0-9_-]/g, "_")
                : "image"
              cleanName = `${baseName || 'image'}.jpg`
            }

            const compressedFile = new File([blob], cleanName, {
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
