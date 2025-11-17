import imageCompression from 'browser-image-compression'

export interface ImageOptimizationOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
  useWebWorker?: boolean
}

/**
 * Compress and optimize image before upload
 * Uses adaptive compression based on file size to prevent corruption
 * Includes validation and fallback to original if compression fails
 */
export async function compressImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<File> {
  const fileSizeMB = file.size / 1024 / 1024

  // STEP 1: AGGRESSIVE COMPRESSION - Target ~70% reduction
  // Goal: 1MB → ~300KB, 5MB → ~1.5MB
  let maxSizeMB: number
  let quality: number

  if (fileSizeMB < 1) {
    // Small files: Target 30% of original size
    maxSizeMB = fileSizeMB * 0.3
    quality = 0.75
  } else if (fileSizeMB < 3) {
    // Small-medium files: Aggressive compression
    maxSizeMB = fileSizeMB * 0.35 // ~65% reduction
    quality = 0.70
  } else if (fileSizeMB < 5) {
    // Medium files: Strong compression
    maxSizeMB = fileSizeMB * 0.30 // ~70% reduction
    quality = 0.65
  } else if (fileSizeMB < 10) {
    // Large files: Very aggressive compression
    maxSizeMB = fileSizeMB * 0.25 // ~75% reduction
    quality = 0.60
  } else {
    // Very large files: Maximum compression
    maxSizeMB = fileSizeMB * 0.20 // ~80% reduction
    quality = 0.55
  }

  console.log(
    `🔥 Aggressive compression: ${fileSizeMB.toFixed(2)}MB → target ${maxSizeMB.toFixed(2)}MB (quality: ${quality}) - ~${Math.round((1 - maxSizeMB/fileSizeMB) * 100)}% reduction`
  )

  const compressionOptions = {
    maxSizeMB: options.maxSizeMB || maxSizeMB,
    maxWidthOrHeight: options.maxWidthOrHeight || 1920, // Reduce from 2560 for more compression
    initialQuality: quality,
    useWebWorker: options.useWebWorker !== undefined ? options.useWebWorker : true,
    fileType: 'image/jpeg', // Force JPEG for better compression (WebP even better but compatibility)
  }

  try {
    const compressed = await imageCompression(file, compressionOptions)

    // VALIDATION 1: Check if compression produced empty file
    if (!compressed || compressed.size === 0) {
      console.error('❌ Compression produced empty file, using original')
      return file
    }

    const compressedSizeMB = compressed.size / 1024 / 1024
    const reduction = ((fileSizeMB - compressedSizeMB) / fileSizeMB) * 100

    console.log(
      `✅ Compressed: ${fileSizeMB.toFixed(2)}MB → ${compressedSizeMB.toFixed(2)}MB (${reduction.toFixed(1)}% reduction)`
    )

    // VALIDATION 2: Check if compression was too aggressive (>95% reduction is suspicious)
    // Increased threshold since we're doing aggressive compression intentionally
    if (reduction > 95) {
      console.warn(
        `⚠️ Compression too aggressive (${reduction.toFixed(1)}% > 95%), might be corrupted, using original`
      )
      return file
    }

    // VALIDATION 3: Check if compressed file is larger than original
    if (compressed.size > file.size) {
      console.log('ℹ️ Compressed size larger than original, using original')
      return file
    }

    return compressed
  } catch (error) {
    console.error('❌ Compression error:', error)
    console.log('↩️ Using original file due to compression error')
    return file // Always fallback to original if compression fails
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
