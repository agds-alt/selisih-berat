'use client'

import { useEffect, useRef, useState } from 'react'
import Quagga from '@ericblade/quagga2'
import { validateJNTBarcode } from '@/lib/utils/barcode'

interface Props {
  isOpen: boolean
  onClose: () => void
  onScanSuccess: (code: string) => void
}

export function ScannerModal({ isOpen, onClose, onScanSuccess }: Props) {
  const videoRef = useRef<HTMLDivElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string>('')
  const [lastDetected, setLastDetected] = useState<string>('')
  const detectionBufferRef = useRef<string[]>([])

  useEffect(() => {
    if (isOpen && videoRef.current) {
      startScanning()
    }

    return () => {
      stopScanning()
    }
  }, [isOpen])

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  const startScanning = () => {
    if (!videoRef.current) return

    Quagga.init(
      {
        inputStream: {
          name: 'Live',
          type: 'LiveStream',
          target: videoRef.current,
          constraints: {
            facingMode: 'environment', // Back camera
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 480, ideal: 720, max: 1080 },
          },
        },
        decoder: {
          readers: [
            'code_128_reader',
            'ean_reader',
            'ean_8_reader',
            'code_39_reader',
            'upc_reader',
            'codabar_reader',
          ],
        },
        locate: true,
        locator: {
          patchSize: 'medium',
          halfSample: true,
        },
      },
      (err) => {
        if (err) {
          console.error('Quagga init error:', err)
          setError('Tidak bisa mengakses kamera. Pastikan izin kamera diaktifkan.')
          return
        }
        Quagga.start()
        setIsScanning(true)
        setError('')
      }
    )

    // On barcode detected
    Quagga.onDetected((result) => {
      const code = result.codeResult.code
      if (!code) return

      // Add to buffer to prevent duplicate scans
      detectionBufferRef.current.push(code)
      if (detectionBufferRef.current.length > 10) {
        detectionBufferRef.current.shift()
      }

      // Check if code appears at least 3 times in buffer (confidence check)
      const occurrences = detectionBufferRef.current.filter((c) => c === code).length

      if (occurrences >= 3 && lastDetected !== code) {
        setLastDetected(code)

        // Success feedback (vibration if supported)
        if ('vibrate' in navigator) {
          navigator.vibrate(200)
        }

        // Stop scanning and callback
        stopScanning()
        onScanSuccess(code)
      }
    })
  }

  const stopScanning = () => {
    if (isScanning) {
      try {
        Quagga.stop()
        Quagga.offDetected()
        Quagga.offProcessed()
      } catch (err) {
        console.error('Error stopping scanner:', err)
      }
      setIsScanning(false)
      detectionBufferRef.current = []
      setLastDetected('')
    }
  }

  const handleClose = () => {
    stopScanning()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-[100] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black bg-opacity-50">
        <div className="text-white">
          <h3 className="text-lg font-semibold">Scan Barcode Resi</h3>
          <p className="text-sm text-gray-300">Arahkan kamera ke barcode</p>
        </div>
        <button
          onClick={handleClose}
          className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors active:scale-95"
          aria-label="Close scanner"
        >
          ✕
        </button>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 relative overflow-hidden">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="bg-red-500 text-white p-6 rounded-lg text-center max-w-md">
              <p className="text-lg font-semibold mb-2">⚠️ Error</p>
              <p className="text-sm">{error}</p>
              <button
                onClick={handleClose}
                className="mt-4 px-6 py-2 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Video Stream */}
            <div ref={videoRef} className="w-full h-full" />

            {/* Scanning Overlay */}
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Corner Brackets */}
                <div className="absolute top-1/4 left-1/4 right-1/4 bottom-1/4 border-4 border-red-500 rounded-lg">
                  {/* Top-left corner */}
                  <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                  {/* Top-right corner */}
                  <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                  {/* Bottom-left corner */}
                  <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                  {/* Bottom-right corner */}
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                </div>

                {/* Scanning Line Animation */}
                <div className="absolute top-1/4 left-1/4 right-1/4 bottom-1/4 overflow-hidden">
                  <div className="w-full h-1 bg-red-500 shadow-lg shadow-red-500 animate-scan"></div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-black bg-opacity-50 p-4 text-center text-white space-y-2">
        <p className="text-sm">
          📱 Posisikan barcode di dalam kotak
        </p>
        <p className="text-xs text-gray-400">
          ⚡ Scan otomatis ketika terdeteksi
        </p>
      </div>
    </div>
  )
}
