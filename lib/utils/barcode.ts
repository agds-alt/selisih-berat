import Quagga from '@ericblade/quagga2'

export interface BarcodeConfig {
  inputStream: {
    type: string
    target: HTMLElement | string
    constraints: {
      width: any
      height: any
      facingMode: string
    }
  }
  decoder: {
    readers: string[]
  }
  locate: boolean
}

// Duplicate detection buffer
let lastDetectedCode: string | null = null
let lastDetectionTime: number = 0
const DUPLICATE_DETECTION_WINDOW = 2000 // 2 seconds

export function getDefaultBarcodeConfig(target: HTMLElement | string): BarcodeConfig {
  return {
    inputStream: {
      type: 'LiveStream',
      target,
      constraints: {
        width: { min: 640 },
        height: { min: 480 },
        facingMode: 'environment', // Use back camera
      },
    },
    decoder: {
      readers: [
        'code_128_reader', // Primary format for JNT barcodes
        'ean_reader',
        'ean_8_reader',
        'code_39_reader',
        'codabar_reader',
        'upc_reader',
        'upc_e_reader',
        // 'qr_code_reader', // Removed: Quagga2 doesn't properly support QR codes (causes TypeError)
      ],
    },
    locate: true,
  }
}

export async function initBarcodeScanner(
  targetElement: HTMLElement | string,
  onDetected: (code: string) => void,
  onError?: (error: any) => void
): Promise<void> {
  // Reset duplicate detection on init
  lastDetectedCode = null
  lastDetectionTime = 0

  return new Promise((resolve, reject) => {
    const config = getDefaultBarcodeConfig(targetElement)

    Quagga.init(config as any, (err) => {
      if (err) {
        console.error('Barcode scanner init error:', err)
        if (onError) onError(err)
        reject(err)
        return
      }

      Quagga.start()
      resolve()
    })

    // Listen for detected barcodes with duplicate prevention
    Quagga.onDetected((result) => {
      if (result.codeResult) {
        const code = result.codeResult.code
        if (code) {
          const now = Date.now()

          // Prevent duplicate scans within detection window
          if (
            code !== lastDetectedCode ||
            now - lastDetectionTime > DUPLICATE_DETECTION_WINDOW
          ) {
            lastDetectedCode = code
            lastDetectionTime = now
            onDetected(code)
          }
        }
      }
    })
  })
}

export function stopBarcodeScanner(): void {
  try {
    Quagga.stop()
    // Clean up camera resources
    Quagga.offDetected()
    Quagga.offProcessed()

    // Reset duplicate detection
    lastDetectedCode = null
    lastDetectionTime = 0
  } catch (error) {
    console.error('Error stopping barcode scanner:', error)
  }
}

export function validateJNTBarcode(code: string): boolean {
  if (!code || code.length < 5) return false

  // Basic validation: check if starts with JT or JNT
  const jntPattern = /^(JT|JNT)\d+/i
  const isJNT = jntPattern.test(code)

  // Also accept any alphanumeric code (for flexibility)
  const alphanumericPattern = /^[A-Z0-9]{5,20}$/i
  const isAlphanumeric = alphanumericPattern.test(code)

  return isJNT || isAlphanumeric
}

/**
 * Format barcode for display
 */
export function formatBarcode(code: string): string {
  return code.toUpperCase().trim()
}

/**
 * Sanitize barcode input
 * Removes any non-alphanumeric characters
 */
export function sanitizeBarcode(code: string): string {
  return code.replace(/[^A-Z0-9]/gi, '').toUpperCase()
}

/**
 * Check if barcode is likely a valid shipping number
 * More lenient validation for various carrier formats
 */
export function isValidShippingNumber(code: string): boolean {
  if (!code) return false

  // Remove whitespace
  const cleaned = code.trim()

  // Must be at least 5 characters
  if (cleaned.length < 5) return false

  // Must contain at least one letter or number
  const hasAlphanumeric = /[A-Z0-9]/i.test(cleaned)

  return hasAlphanumeric
}

export function resetDuplicateDetection(): void {
  lastDetectedCode = null
  lastDetectionTime = 0
}
