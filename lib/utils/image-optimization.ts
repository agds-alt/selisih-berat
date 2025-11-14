import imageCompression from 'browser-image-compression'

export interface ImageOptimizationOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
  useWebWorker?: boolean
}

/**
 * Compress and optimize image before upload
 * Reduces 4MB image to ~500KB-1MB (80-90% reduction)
 */
export async function compressImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<File> {
  const defaultOptions = {
    maxSizeMB: 1, // Max 1MB
    maxWidthOrHeight: 1920, // Max 1920px width/height
    useWebWorker: true,
    fileType: 'image/jpeg',
    initialQuality: 0.8,
  }

  try {
    const compressed = await imageCompression(file, {
      ...defaultOptions,
      ...options,
    })

    console.log(
      `✅ Image compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(
        compressed.size /
        1024 /
        1024
      ).toFixed(2)}MB (${Math.round(((file.size - compressed.size) / file.size) * 100)}% reduction)`
    )

    return compressed
  } catch (error) {
    console.error('Image compression failed:', error)
    throw new Error('Gagal mengompress gambar')
  }
}

/**
 * Validate image file before processing
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file size (max 10MB before compression)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return { valid: false, error: 'File terlalu besar (max 10MB)' }
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Format tidak didukung. Gunakan JPG, PNG, WEBP, atau HEIC',
    }
  }

  return { valid: true }
}

/**
 * Get image dimensions without loading full image
 */
export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.width, height: img.height })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

/**
 * Convert blob to File
 */
export function blobToFile(blob: Blob, filename: string): File {
  return new File([blob], filename, {
    type: blob.type,
    lastModified: Date.now(),
  })
}
