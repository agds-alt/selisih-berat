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
        'code_128_reader',
        'ean_reader',
        'ean_8_reader',
        'code_39_reader',
        'codabar_reader',
        'upc_reader',
        'upc_e_reader',
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
  return new Promise((resolve, reject) => {
    const config = getDefaultBarcodeConfig(targetElement)

    Quagga.init(config, (err) => {
      if (err) {
        console.error('Barcode scanner init error:', err)
        if (onError) onError(err)
        reject(err)
        return
      }

      Quagga.start()
      resolve()
    })

    // Listen for detected barcodes
    Quagga.onDetected((result) => {
      if (result.codeResult) {
        const code = result.codeResult.code
        if (code) {
          onDetected(code)
        }
      }
    })
  })
}

export function stopBarcodeScanner(): void {
  Quagga.stop()
}

export function validateJNTBarcode(code: string): boolean {
  // JNT barcode format validation
  // Typically: JNT + numbers, length 10-20 characters
  const jntPattern = /^[A-Z0-9]{10,20}$/
  return jntPattern.test(code)
}
