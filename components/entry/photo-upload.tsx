'use client'

import { useState, useRef } from 'react'
import { addWatermarkToImage } from '@/lib/utils/watermark'
import type { LocationInfo } from '@/lib/types/entry'
import Image from 'next/image'

interface Props {
  onUpload: (urls: { foto_url_1: string; foto_url_2?: string }) => void
  location: LocationInfo | null
  required?: boolean
}

export function PhotoUpload({ onUpload, location, required = true }: Props) {
  const [uploading1, setUploading1] = useState(false)
  const [uploading2, setUploading2] = useState(false)
  const [preview1, setPreview1] = useState<string | null>(null)
  const [preview2, setPreview2] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const input1Ref = useRef<HTMLInputElement>(null)
  const input2Ref = useRef<HTMLInputElement>(null)

  const uploadToCloudinary = async (blob: Blob): Promise<string> => {
    const formData = new FormData()
    formData.append('file', blob)
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)
    formData.append('folder', process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER!)

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      throw new Error('Upload to Cloudinary failed')
    }

    const data = await response.json()
    return data.secure_url
  }

  const handleFileChange = async (
    file: File | null,
    photoNumber: 1 | 2
  ) => {
    if (!file) return

    // Check if location is available
    if (!location) {
      setError('Lokasi GPS belum tersedia. Mohon tunggu sebentar.')
      return
    }

    const setUploading = photoNumber === 1 ? setUploading1 : setUploading2
    const setPreview = photoNumber === 1 ? setPreview1 : setPreview2

    try {
      setError(null)
      setUploading(true)

      // Add watermark to image
      const watermarkedBlob = await addWatermarkToImage(file, {
        location,
        timestamp: new Date(),
      })

      // Create preview
      const previewUrl = URL.createObjectURL(watermarkedBlob)
      setPreview(previewUrl)

      // Upload to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(watermarkedBlob)

      // Call parent callback
      if (photoNumber === 1) {
        onUpload({ foto_url_1: cloudinaryUrl, foto_url_2: preview2 || undefined })
      } else {
        onUpload({ foto_url_1: preview1 || '', foto_url_2: cloudinaryUrl })
      }

      setError(null)
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(`Gagal upload foto ${photoNumber}: ${err.message}`)
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Photo 1 */}
      <div className="space-y-2">
        <label className="block font-semibold text-gray-700">
          📸 Foto 1 {required && <span className="text-red-500">*</span>}
        </label>

        <input
          ref={input1Ref}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null, 1)}
          className="hidden"
        />

        {!preview1 ? (
          <button
            type="button"
            onClick={() => input1Ref.current?.click()}
            disabled={uploading1 || !location}
            className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading1 ? (
              <div className="flex flex-col items-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span>Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <span className="text-4xl">📷</span>
                <span className="text-gray-600">Klik untuk ambil foto 1</span>
                {!location && (
                  <span className="text-xs text-red-500">Tunggu GPS tersedia</span>
                )}
              </div>
            )}
          </button>
        ) : (
          <div className="photo-preview">
            <Image
              src={preview1}
              alt="Preview foto 1"
              width={400}
              height={300}
              className="rounded-lg"
            />
            <button
              type="button"
              onClick={() => {
                setPreview1(null)
                if (input1Ref.current) input1Ref.current.value = ''
              }}
              className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
            >
              ❌
            </button>
          </div>
        )}
      </div>

      {/* Photo 2 (Optional) */}
      <div className="space-y-2">
        <label className="block font-semibold text-gray-700">
          📸 Foto 2 (Opsional)
        </label>

        <input
          ref={input2Ref}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null, 2)}
          className="hidden"
        />

        {!preview2 ? (
          <button
            type="button"
            onClick={() => input2Ref.current?.click()}
            disabled={uploading2 || !location}
            className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading2 ? (
              <div className="flex flex-col items-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span>Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <span className="text-4xl">📷</span>
                <span className="text-gray-600">Klik untuk ambil foto 2</span>
                {!location && (
                  <span className="text-xs text-red-500">Tunggu GPS tersedia</span>
                )}
              </div>
            )}
          </button>
        ) : (
          <div className="photo-preview">
            <Image
              src={preview2}
              alt="Preview foto 2"
              width={400}
              height={300}
              className="rounded-lg"
            />
            <button
              type="button"
              onClick={() => {
                setPreview2(null)
                if (input2Ref.current) input2Ref.current.value = ''
              }}
              className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
            >
              ❌
            </button>
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p>• Foto akan otomatis ditambahkan watermark GPS dan timestamp</p>
        <p>• Gunakan foto yang jelas dan fokus</p>
        <p>• Upload langsung ke Cloudinary (hemat bandwidth)</p>
      </div>
    </div>
  )
}
