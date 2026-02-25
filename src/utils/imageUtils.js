/**
 * Compress and resize an image file using canvas.
 * @param {File|Blob} file - The image file to compress
 * @param {number} maxWidth - Max width in pixels (default 1920)
 * @param {number} quality - JPEG quality 0-1 (default 0.8)
 * @returns {Promise<{ base64: string, width: number, height: number, sizeBytes: number }>}
 */
export function compressImage(file, maxWidth = 1920, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img

      // Scale down if wider than maxWidth
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width = maxWidth
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      const base64 = canvas.toDataURL('image/jpeg', quality)
      const sizeBytes = Math.round((base64.length - 'data:image/jpeg;base64,'.length) * 0.75)

      resolve({ base64, width, height, sizeBytes })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

/**
 * Convert a canvas element to a base64 JPEG string.
 */
export function canvasToBase64(canvas, quality = 0.8) {
  return canvas.toDataURL('image/jpeg', quality)
}

/**
 * Validate that a file is an acceptable image.
 * @param {File} file
 * @param {number} maxSizeMB
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateImageFile(file, maxSizeMB = 5) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Please select a JPEG, PNG, or WebP image.' }
  }

  const sizeMB = file.size / (1024 * 1024)
  if (sizeMB > maxSizeMB) {
    return { valid: false, error: `Image too large (${sizeMB.toFixed(1)} MB). Max ${maxSizeMB} MB.` }
  }

  return { valid: true }
}
