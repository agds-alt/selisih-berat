import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export interface CloudinaryPhoto {
  public_id: string
  secure_url: string
  format: string
  width: number
  height: number
  bytes: number
  created_at: string
  resource_type: string
}

export interface CloudinaryFetchOptions {
  max_results?: number
  next_cursor?: string
  prefix?: string
}

/**
 * Fetch photos from Cloudinary folder
 */
export async function fetchCloudinaryPhotos(
  folder: string,
  options: CloudinaryFetchOptions = {}
): Promise<{ resources: CloudinaryPhoto[]; next_cursor?: string }> {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folder,
      max_results: options.max_results || 500,
      next_cursor: options.next_cursor,
      resource_type: 'image',
    })

    return {
      resources: result.resources,
      next_cursor: result.next_cursor,
    }
  } catch (error: any) {
    console.error('Error fetching Cloudinary photos:', error)
    throw new Error(`Failed to fetch photos: ${error.message}`)
  }
}

/**
 * Delete a single photo from Cloudinary
 */
export async function deleteCloudinaryPhoto(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result.result === 'ok'
  } catch (error: any) {
    console.error('Error deleting Cloudinary photo:', error)
    throw new Error(`Failed to delete photo: ${error.message}`)
  }
}

/**
 * Delete multiple photos from Cloudinary
 */
export async function deleteCloudinaryPhotos(publicIds: string[]): Promise<{
  deleted: string[]
  failed: string[]
}> {
  const deleted: string[] = []
  const failed: string[] = []

  // Process in batches of 100 (Cloudinary limit)
  const batchSize = 100
  for (let i = 0; i < publicIds.length; i += batchSize) {
    const batch = publicIds.slice(i, i + batchSize)

    try {
      const result = await cloudinary.api.delete_resources(batch)

      Object.entries(result.deleted).forEach(([publicId, status]) => {
        if (status === 'deleted') {
          deleted.push(publicId)
        } else {
          failed.push(publicId)
        }
      })
    } catch (error: any) {
      console.error('Error deleting batch:', error)
      failed.push(...batch)
    }
  }

  return { deleted, failed }
}

/**
 * Get photo metadata from Cloudinary
 */
export async function getCloudinaryPhotoInfo(publicId: string): Promise<CloudinaryPhoto | null> {
  try {
    const result = await cloudinary.api.resource(publicId)
    return result
  } catch (error: any) {
    console.error('Error fetching photo info:', error)
    return null
  }
}

/**
 * Get total storage usage
 */
export async function getCloudinaryUsage(): Promise<{
  used_bytes: number
  used_percent: number
  limit: number
}> {
  try {
    const result = await cloudinary.api.usage()
    return {
      used_bytes: result.storage.usage,
      used_percent: result.storage.used_percent,
      limit: result.storage.limit,
    }
  } catch (error: any) {
    console.error('Error fetching Cloudinary usage:', error)
    return {
      used_bytes: 0,
      used_percent: 0,
      limit: 0,
    }
  }
}

/**
 * Generate thumbnail URL with Cloudinary transformations
 */
export function generateThumbnailUrl(url: string, width: number = 300, height: number = 300): string {
  if (!url) return ''

  // If it's already a Cloudinary URL, add transformation
  if (url.includes('cloudinary.com')) {
    const parts = url.split('/upload/')
    if (parts.length === 2) {
      // Aggressive optimization: f_auto (format), q_auto:good (quality), c_fill (crop)
      return `${parts[0]}/upload/w_${width},h_${height},c_fill,q_auto:good,f_auto/${parts[1]}`
    }
  }

  return url
}

/**
 * Optimize Cloudinary URL for delivery with aggressive compression
 * Adds automatic format conversion (WebP/AVIF) and quality optimization
 * This can save 40-60% bandwidth without visible quality loss
 */
export function optimizeCloudinaryUrl(url: string, options?: {
  quality?: 'auto:low' | 'auto:good' | 'auto:best' | 'auto:eco'
  format?: 'auto' | 'webp' | 'avif' | 'jpg'
  width?: number
  height?: number
}): string {
  if (!url) return ''
  if (!url.includes('cloudinary.com')) return url

  const parts = url.split('/upload/')
  if (parts.length !== 2) return url

  const {
    quality = 'auto:good', // Good balance between quality and size
    format = 'auto', // Let Cloudinary choose best format (WebP/AVIF)
    width,
    height
  } = options || {}

  // Build transformation string
  const transformations: string[] = []

  if (width) transformations.push(`w_${width}`)
  if (height) transformations.push(`h_${height}`)
  if (width || height) transformations.push('c_limit') // Limit size, don't crop

  transformations.push(`q_${quality}`) // Auto quality
  transformations.push(`f_${format}`) // Auto format (WebP/AVIF when supported)
  transformations.push('fl_progressive') // Progressive loading
  transformations.push('fl_lossy') // Lossy compression for smaller files

  const transformString = transformations.join(',')

  return `${parts[0]}/upload/${transformString}/${parts[1]}`
}

/**
 * Extract public ID from Cloudinary URL
 */
export function extractPublicId(url: string): string | null {
  if (!url || !url.includes('cloudinary.com')) return null

  try {
    const parts = url.split('/upload/')
    if (parts.length !== 2) return null

    const pathParts = parts[1].split('/')
    // Remove version and transformation parameters
    const relevantParts = pathParts.filter(
      (part) => !part.startsWith('v') || part.length < 10
    )

    const publicIdWithExt = relevantParts[relevantParts.length - 1]
    const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'))

    // Include folder path
    // Default to 'weight-entries' to match production configuration
    const folder = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || 'weight-entries'
    return `${folder}/${publicId}`
  } catch (error) {
    console.error('Error extracting public ID:', error)
    return null
  }
}
