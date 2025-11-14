'use client'

import { useState, useRef } from 'react'
import { addWatermarkToImage } from '@/lib/utils/watermark'
import { compressImage, validateImageFile } from '@/lib/utils/image-optimization'
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
  const [compressionInfo1, setCompressionInfo1] = useState<string | null>(null)
  const [compressionInfo2, setCompressionInfo2] = useState<string | null>(null)
  const [uploadProgress1, setUploadProgress1] = useState<string>('')
  const [uploadProgress2, setUploadProgress2] = useState<string>('')

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
    const setProgress = photoNumber === 1 ? setUploadProgress1 : setUploadProgress2
    const setCompressionInfo = photoNumber === 1 ? setCompressionInfo1 : setCompressionInfo2

    try {
      setError(null)
      setUploading(true)
      setProgress('Memulai...')

      // Step 1: Validate file (5%)
      setProgress('Validasi file... (5%)')
      const validation = validateImageFile(file)
      if (!validation.valid) {
        setError(validation.error || 'File tidak valid')
        return
      }

      // Step 2: Compress image (15%)
      setProgress('Kompresi gambar... (15%)')
      const originalSize = (file.size / 1024 / 1024).toFixed(2)
      const compressedFile = await compressImage(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      })
      const compressedSize = (compressedFile.size / 1024 / 1024).toFixed(2)
      const reduction = Math.round(((file.size - compressedFile.size) / file.size) * 100)

      setCompressionInfo(`${originalSize}MB → ${compressedSize}MB (${reduction}% lebih kecil)`)

      // Step 3: Add watermark (40%)
      setProgress('Menambahkan watermark... (40%)')
      const watermarkedBlob = await addWatermarkToImage(compressedFile, {
        location,
        timestamp: new Date(),
      })

      // Step 4: Create preview (60%)
      setProgress('Membuat preview... (60%)')
      const previewUrl = URL.createObjectURL(watermarkedBlob)
      setPreview(previewUrl)

      // Step 5: Upload to Cloudinary (80%)
      setProgress('Upload ke cloud... (80%)')
      const cloudinaryUrl = await uploadToCloudinary(watermarkedBlob)

      // Step 6: Finalize (100%)
      setProgress('Selesai! (100%)')

      // Call parent callback
      if (photoNumber === 1) {
        onUpload({ foto_url_1: cloudinaryUrl, foto_url_2: preview2 || undefined })
      } else {
        onUpload({ foto_url_1: preview1 || '', foto_url_2: cloudinaryUrl })
      }

      setError(null)

      // Clear progress after 2 seconds
      setTimeout(() => setProgress(''), 2000)
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(`Gagal upload foto ${photoNumber}: ${err.message}`)
      setPreview(null)
      setCompressionInfo(null)
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
                <span className="font-semibold">{uploadProgress1}</span>
                {compressionInfo1 && (
                  <span className="text-xs text-green-600">✅ {compressionInfo1}</span>
                )}
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
          <div className="photo-preview relative">
            <Image
              src={preview1}
              alt="Preview foto 1"
              width={400}
              height={300}
              className="rounded-lg"
            />
            {compressionInfo1 && (
              <div className="absolute bottom-2 left-2 right-2 bg-green-600 bg-opacity-90 text-white text-xs p-2 rounded">
                ✅ Terkompresi: {compressionInfo1}
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setPreview1(null)
                setCompressionInfo1(null)
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
                <span className="font-semibold">{uploadProgress2}</span>
                {compressionInfo2 && (
                  <span className="text-xs text-green-600">✅ {compressionInfo2}</span>
                )}
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
          <div className="photo-preview relative">
            <Image
              src={preview2}
              alt="Preview foto 2"
              width={400}
              height={300}
              className="rounded-lg"
            />
            {compressionInfo2 && (
              <div className="absolute bottom-2 left-2 right-2 bg-green-600 bg-opacity-90 text-white text-xs p-2 rounded">
                ✅ Terkompresi: {compressionInfo2}
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setPreview2(null)
                setCompressionInfo2(null)
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
        <p>• 🗜️ Foto otomatis dikompresi 80-90% (4MB → ~500KB) untuk upload cepat</p>
        <p>• 📍 Watermark GPS dan timestamp ditambahkan otomatis</p>
        <p>• 📸 Gunakan foto yang jelas dan fokus</p>
        <p>• ☁️ Upload langsung ke Cloudinary (hemat bandwidth)</p>
      </div>
    </div>
  )
}
