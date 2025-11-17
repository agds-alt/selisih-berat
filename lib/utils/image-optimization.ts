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

  console.log(`📸 Input file: ${file.name}, type: ${file.type}, size: ${fileSizeMB.toFixed(2)}MB`)

  // STEP 1: Conservative compression with size-based targeting
  // Target: 70% reduction with quality control
  let maxSizeMB: number
  let maxWidthOrHeight: number

  if (fileSizeMB < 1) {
    // Small files: Light compression
    maxSizeMB = 0.5
    maxWidthOrHeight = 2048
  } else if (fileSizeMB < 3) {
    // Medium files: Target ~1MB
    maxSizeMB = 1.2
    maxWidthOrHeight = 2048
  } else if (fileSizeMB < 5) {
    // Large files: Target ~1.5MB
    maxSizeMB = 1.8
    maxWidthOrHeight = 2048
  } else if (fileSizeMB < 10) {
    // Very large files: Target ~3MB
    maxSizeMB = 3.0
    maxWidthOrHeight = 2560
  } else {
    // Huge files: Target ~4MB
    maxSizeMB = 4.0
    maxWidthOrHeight = 2560
  }

  const targetReduction = Math.round((1 - maxSizeMB / fileSizeMB) * 100)
  console.log(
    `🔥 Size-based compression: ${fileSizeMB.toFixed(2)}MB → target ${maxSizeMB.toFixed(2)}MB (~${targetReduction}% reduction)`
  )

  const compressionOptions = {
    maxSizeMB: options.maxSizeMB || maxSizeMB,
    maxWidthOrHeight: options.maxWidthOrHeight || maxWidthOrHeight,
    maxIteration: 10, // Allow multiple iterations to reach target
    useWebWorker: options.useWebWorker !== undefined ? options.useWebWorker : true,
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

    // VALIDATION 2: Check if compression was suspiciously aggressive
    // Note: Some images (especially screenshots with large solid colors) can compress >90% safely
    // Only reject if compression is EXTREME (>97%) which indicates likely corruption
    if (reduction > 97) {
      console.warn(
        `⚠️ Compression too aggressive (${reduction.toFixed(1)}% > 97%), might be corrupted, using original`
      )
      return file
    }

    // Warning for high compression but still allow it
    if (reduction > 85) {
      console.warn(
        `⚠️ High compression rate: ${reduction.toFixed(1)}% - This is normal for screenshots/simple images. Using compressed version.`
      )
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
