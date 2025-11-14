import type { LocationInfo } from '@/lib/types/entry'

export interface WatermarkOptions {
  location: LocationInfo
  timestamp: Date
  text?: string
}

export async function addWatermarkToImage(
  file: File,
  options: WatermarkOptions
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('Canvas context not available'))
          return
        }

        // Set canvas size to image size
        canvas.width = img.width
        canvas.height = img.height

        // Draw original image
        ctx.drawImage(img, 0, 0)

        // Draw watermark overlay
        drawWatermark(ctx, canvas.width, canvas.height, options)

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to create blob'))
            }
          },
          'image/jpeg',
          0.95 // Quality
        )
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      img.src = e.target?.result as string
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsDataURL(file)
  })
}

function drawWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: WatermarkOptions
): void {
  const padding = 40
  const lineHeight = 60
  const fontSize = 48

  // Semi-transparent overlay at bottom
  const overlayHeight = lineHeight * 4 + padding * 2
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
  ctx.fillRect(0, height - overlayHeight, width, overlayHeight)

  // Text styling
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold ${fontSize}px Arial`
  ctx.textAlign = 'left'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
  ctx.shadowBlur = 8
  ctx.shadowOffsetX = 4
  ctx.shadowOffsetY = 4

  let yPosition = height - overlayHeight + padding + fontSize

  // Draw timestamp
  const dateStr = options.timestamp.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  const timeStr = options.timestamp.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  ctx.fillText(`📅 ${dateStr} ${timeStr} WIB`, padding, yPosition)
  yPosition += lineHeight

  // Draw coordinates
  const coordsStr = `📍 ${options.location.latitude.toFixed(6)}, ${options.location.longitude.toFixed(6)}`
  ctx.fillText(coordsStr, padding, yPosition)
  yPosition += lineHeight

  // Draw location if available
  if (options.location.address) {
    ctx.font = `${fontSize - 8}px Arial`
    const maxWidth = width - padding * 2
    const locationText = truncateText(ctx, options.location.address, maxWidth)
    ctx.fillText(`🌍 ${locationText}`, padding, yPosition)
    yPosition += lineHeight
  }

  // Draw accuracy
  ctx.font = `${fontSize - 12}px Arial`
  ctx.fillText(`✓ Accuracy: ±${Math.round(options.location.accuracy)}m`, padding, yPosition)

  // Reset shadow
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
}

function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  const metrics = ctx.measureText(text)
  if (metrics.width <= maxWidth) {
    return text
  }

  let truncated = text
  while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
    truncated = truncated.slice(0, -1)
  }

  return truncated + '...'
}
