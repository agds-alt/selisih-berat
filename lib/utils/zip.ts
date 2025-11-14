import JSZip from 'jszip'

export interface DownloadProgress {
  current: number
  total: number
  percentage: number
  currentFile: string
}

export type ProgressCallback = (progress: DownloadProgress) => void

/**
 * Download photos as ZIP file
 */
export async function downloadPhotosAsZip(
  photoUrls: string[],
  filename: string = 'photos.zip',
  onProgress?: ProgressCallback
): Promise<void> {
  if (!photoUrls || photoUrls.length === 0) {
    throw new Error('No photos to download')
  }

  try {
    const zip = new JSZip()
    const total = photoUrls.length

    // Fetch and add each photo to ZIP
    for (let i = 0; i < photoUrls.length; i++) {
      const url = photoUrls[i]
      const filename = getFilenameFromUrl(url, i)

      if (onProgress) {
        onProgress({
          current: i + 1,
          total,
          percentage: Math.round(((i + 1) / total) * 100),
          currentFile: filename,
        })
      }

      try {
        // Fetch the image
        const response = await fetch(url)
        if (!response.ok) {
          console.error(`Failed to fetch ${url}:`, response.statusText)
          continue
        }

        const blob = await response.blob()
        zip.file(filename, blob)
      } catch (error) {
        console.error(`Error downloading ${url}:`, error)
        // Continue with other files even if one fails
      }
    }

    // Generate ZIP blob
    const zipBlob = await zip.generateAsync(
      {
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: {
          level: 6,
        },
      },
      (metadata) => {
        if (onProgress) {
          onProgress({
            current: total,
            total,
            percentage: Math.round(metadata.percent),
            currentFile: 'Generating ZIP...',
          })
        }
      }
    )

    // Trigger download
    triggerDownload(zipBlob, filename)
  } catch (error: any) {
    console.error('Error creating ZIP:', error)
    throw new Error(`Failed to create ZIP: ${error.message}`)
  }
}

/**
 * Download photos in batches to prevent memory issues
 */
export async function downloadPhotosAsZipBatched(
  photoUrls: string[],
  filename: string = 'photos.zip',
  batchSize: number = 100,
  onProgress?: ProgressCallback
): Promise<void> {
  if (!photoUrls || photoUrls.length === 0) {
    throw new Error('No photos to download')
  }

  try {
    const zip = new JSZip()
    const total = photoUrls.length

    // Process in batches
    for (let batchStart = 0; batchStart < photoUrls.length; batchStart += batchSize) {
      const batchEnd = Math.min(batchStart + batchSize, photoUrls.length)
      const batch = photoUrls.slice(batchStart, batchEnd)

      // Fetch all images in batch concurrently
      const fetchPromises = batch.map(async (url, index) => {
        const globalIndex = batchStart + index
        const filename = getFilenameFromUrl(url, globalIndex)

        try {
          const response = await fetch(url)
          if (!response.ok) {
            console.error(`Failed to fetch ${url}:`, response.statusText)
            return null
          }

          const blob = await response.blob()
          return { filename, blob }
        } catch (error) {
          console.error(`Error downloading ${url}:`, error)
          return null
        }
      })

      const results = await Promise.all(fetchPromises)

      // Add successfully fetched images to ZIP
      results.forEach((result) => {
        if (result) {
          zip.file(result.filename, result.blob)
        }
      })

      // Update progress
      if (onProgress) {
        onProgress({
          current: batchEnd,
          total,
          percentage: Math.round((batchEnd / total) * 100),
          currentFile: `Processing batch ${Math.floor(batchStart / batchSize) + 1}...`,
        })
      }
    }

    // Generate ZIP blob
    const zipBlob = await zip.generateAsync(
      {
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: {
          level: 6,
        },
      },
      (metadata) => {
        if (onProgress) {
          onProgress({
            current: total,
            total,
            percentage: Math.round(metadata.percent),
            currentFile: 'Generating ZIP...',
          })
        }
      }
    )

    // Trigger download
    triggerDownload(zipBlob, filename)
  } catch (error: any) {
    console.error('Error creating ZIP:', error)
    throw new Error(`Failed to create ZIP: ${error.message}`)
  }
}

/**
 * Extract filename from URL
 */
function getFilenameFromUrl(url: string, index: number): string {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const segments = pathname.split('/')
    const lastSegment = segments[segments.length - 1]

    // If we can extract a meaningful filename, use it
    if (lastSegment && lastSegment.includes('.')) {
      return lastSegment
    }

    // Otherwise, generate a filename based on index
    const ext = getExtensionFromUrl(url) || 'jpg'
    return `photo_${String(index + 1).padStart(5, '0')}.${ext}`
  } catch (error) {
    const ext = getExtensionFromUrl(url) || 'jpg'
    return `photo_${String(index + 1).padStart(5, '0')}.${ext}`
  }
}

/**
 * Get file extension from URL
 */
function getExtensionFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const match = pathname.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    return match ? match[1] : null
  } catch (error) {
    return null
  }
}

/**
 * Trigger browser download
 */
function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up
  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 100)
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}
