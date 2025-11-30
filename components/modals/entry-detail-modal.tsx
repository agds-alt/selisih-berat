'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Clock, User, Camera, FileText, Package, Scale, Copy, Check } from 'lucide-react'
import type { Entry } from '@/lib/types/entry'
import { formatDateShort, formatTime } from '@/lib/utils/helpers'
import { PhotoViewerModal } from './photo-viewer-modal'
import { Badge } from '@/components/ui/badge'

interface EntryDetailModalProps {
  isOpen: boolean
  onClose: () => void
  entry: Entry | null
}

// Animation variants
const backdropFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 }
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as any }
}

const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as any }
}

// Helper to get gradient based on selisih
const getSelisihGradient = (selisih: number) => {
  const abs = Math.abs(selisih)
  if (abs < 0.5) return 'from-emerald-500 via-green-500 to-teal-600'
  if (abs < 1) return 'from-amber-500 via-yellow-500 to-orange-500'
  return 'from-rose-500 via-red-500 to-pink-600'
}

const getSelisihTextColor = (selisih: number) => {
  const abs = Math.abs(selisih)
  if (abs < 0.5) return 'text-green-600'
  if (abs < 1) return 'text-yellow-600'
  return 'text-red-600'
}

const getSelisihBgColor = (selisih: number) => {
  const abs = Math.abs(selisih)
  if (abs < 0.5) return 'bg-green-50 border-green-200'
  if (abs < 1) return 'bg-yellow-50 border-yellow-200'
  return 'bg-red-50 border-red-200'
}

export function EntryDetailModal({ isOpen, onClose, entry }: EntryDetailModalProps) {
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false)
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)

  if (!isOpen || !entry) return null

  const handlePhotoClick = (photoUrl: string) => {
    setSelectedPhotoUrl(photoUrl)
    setPhotoViewerOpen(true)
  }

  const handleCopyResi = async () => {
    try {
      await navigator.clipboard.writeText(entry.no_resi)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Parse GPS data from catatan if exists
  let gpsData: { lat?: number; lng?: number; location?: string } | null = null
  try {
    if (entry.catatan) {
      const parsed = JSON.parse(entry.catatan)
      if (parsed.gps_lat && parsed.gps_lng) {
        gpsData = {
          lat: parsed.gps_lat,
          lng: parsed.gps_lng,
          location: parsed.location
        }
      }
    }
  } catch {
    // Not JSON, treat as regular catatan
  }

  const photos = [entry.foto_url_1, entry.foto_url_2].filter(Boolean) as string[]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            {...backdropFade}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            {...scaleIn}
            className="fixed left-4 right-4 top-4 bottom-16 max-w-2xl mx-auto my-auto z-[60] max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden h-full flex flex-col">
              {/* Header - Gradient based on selisih */}
              <div className={`bg-gradient-to-br ${getSelisihGradient(entry.selisih)} p-6 text-white relative overflow-hidden flex-shrink-0`}>
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full blur-2xl" />
                </div>

                <motion.button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors z-20"
                  whileHover={{ scale: 1.05, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>

                {/* Resi info */}
                <div className="relative z-10">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                      <Package className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-xl font-bold">No. Resi</h2>
                        <motion.button
                          onClick={handleCopyResi}
                          className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {copied ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </motion.button>
                      </div>
                      <p className="font-mono text-lg mb-1">{entry.no_resi}</p>
                      <p className="text-white/90 text-sm">{entry.nama}</p>
                    </div>
                  </div>

                  {/* Selisih display */}
                  <div className="flex items-center justify-between">
                    <div className="bg-white/95 backdrop-blur-sm px-5 py-2.5 rounded-xl shadow-lg border border-white/50">
                      <div className="flex items-baseline gap-2">
                        <span className={`text-3xl font-extrabold ${getSelisihTextColor(entry.selisih)}`}>
                          {entry.selisih >= 0 ? '+' : ''}{entry.selisih}
                        </span>
                        <span className="text-sm text-gray-500 font-medium">kg</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Selisih Berat</p>
                    </div>
                    <div className="bg-white/25 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/30">
                      <Badge
                        variant={
                          entry.status === 'approved' ? 'approved' :
                          entry.status === 'rejected' ? 'rejected' :
                          'pending'
                        }
                        size="sm"
                      >
                        {entry.status || 'pending'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="overflow-y-auto flex-1 px-6 pt-6 pb-6 space-y-5">
                {/* Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Date & Time */}
                  <motion.div
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100"
                    {...slideInLeft}
                    transition={{ ...slideInLeft.transition, delay: 0 }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-blue-600 mb-1">Tanggal & Waktu</p>
                        <p className="font-semibold text-gray-900 text-sm">
                          {entry.created_at ? formatDateShort(entry.created_at) : '-'}
                        </p>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {entry.created_at ? formatTime(entry.created_at) : '-'}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Creator */}
                  <motion.div
                    className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100"
                    {...slideInLeft}
                    transition={{ ...slideInLeft.transition, delay: 0.1 }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-purple-600 mb-1">Dibuat Oleh</p>
                        <p className="font-semibold text-gray-900 text-sm truncate">{entry.created_by || 'Unknown'}</p>
                        <p className="text-xs text-gray-600 mt-0.5">ID: {entry.id}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* GPS Location - Full width if exists */}
                  {gpsData && (
                    <motion.div
                      className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100 sm:col-span-2"
                      {...slideInLeft}
                      transition={{ ...slideInLeft.transition, delay: 0.2 }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-green-600 mb-1">Lokasi GPS</p>
                          {gpsData.location ? (
                            <p className="font-semibold text-gray-900 text-sm">{gpsData.location}</p>
                          ) : (
                            <p className="font-mono text-sm text-gray-700">
                              {gpsData.lat?.toFixed(6)}, {gpsData.lng?.toFixed(6)}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Weight Details */}
                <motion.div
                  className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                  {...slideInLeft}
                  transition={{ ...slideInLeft.transition, delay: 0.3 }}
                >
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Scale className="w-5 h-5" />
                    Detail Berat
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">Berat Resi</p>
                      <p className="text-lg font-bold text-gray-900">{entry.berat_resi}</p>
                      <p className="text-xs text-gray-500">kg</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">Berat Aktual</p>
                      <p className="text-lg font-bold text-gray-900">{entry.berat_aktual}</p>
                      <p className="text-xs text-gray-500">kg</p>
                    </div>
                    <div className={`text-center rounded-lg border-2 p-2 ${getSelisihBgColor(entry.selisih)}`}>
                      <p className="text-xs text-gray-600 mb-1">Selisih</p>
                      <p className={`text-lg font-bold ${getSelisihTextColor(entry.selisih)}`}>
                        {entry.selisih >= 0 ? '+' : ''}{entry.selisih}
                      </p>
                      <p className="text-xs text-gray-500">kg</p>
                    </div>
                  </div>
                </motion.div>

                {/* Photos */}
                {photos.length > 0 && (
                  <motion.div
                    {...slideInLeft}
                    transition={{ ...slideInLeft.transition, delay: 0.4 }}
                  >
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Camera className="w-5 h-5" />
                      Foto Dokumentasi ({photos.length})
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {photos.map((url, idx) => (
                        <motion.button
                          key={idx}
                          onClick={() => handlePhotoClick(url)}
                          className="aspect-square rounded-xl overflow-hidden shadow-md cursor-pointer group relative"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            delay: 0.5 + idx * 0.1,
                            duration: 0.3,
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <img
                            src={url}
                            alt={`Foto ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors duration-200">
                            <Camera className="w-8 h-8 text-white drop-shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Notes - if not GPS data */}
                {entry.catatan && !gpsData && (
                  <motion.div
                    className="bg-amber-50 rounded-xl p-4 border border-amber-200"
                    {...slideInLeft}
                    transition={{ ...slideInLeft.transition, delay: 0.5 }}
                  >
                    <div className="flex items-start gap-2">
                      <FileText className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-amber-900 mb-1">Catatan</h4>
                        <p className="text-sm text-amber-800">{entry.catatan}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Bottom spacer */}
                <div className="h-4" />
              </div>
            </div>
          </motion.div>

          {/* Photo Viewer Modal */}
          <PhotoViewerModal
            isOpen={photoViewerOpen}
            onClose={() => setPhotoViewerOpen(false)}
            photoUrl={selectedPhotoUrl}
            metadata={{
              no_resi: entry.no_resi,
              nama: entry.nama,
              created_at: entry.created_at || undefined,
              created_by: entry.created_by || undefined
            }}
          />
        </>
      )}
    </AnimatePresence>
  )
}
