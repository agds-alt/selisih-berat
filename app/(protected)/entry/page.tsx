'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { LocationDisplay } from '@/components/entry/location-display'
import { BarcodeScanner } from '@/components/entry/barcode-scanner'
import { PhotoUpload } from '@/components/entry/photo-upload'
import { useToast } from '@/components/ui/toast'
import { calculateSelisih } from '@/lib/utils/helpers'
import { formatRupiah } from '@/lib/utils/earnings'
import type { LocationInfo } from '@/lib/types/entry'

export default function EntryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [location, setLocation] = useState<LocationInfo | null>(null)
  const [ratePerEntry, setRatePerEntry] = useState(500)
  const [dailyBonus, setDailyBonus] = useState(50000)
  const [userName, setUserName] = useState('')

  // Get pre-filled no_resi from URL params (from scanner)
  const prefilledNoResi = searchParams.get('no_resi') || ''

  const [formData, setFormData] = useState({
    nama: '',
    no_resi: prefilledNoResi, // 👈 AUTO-FILL from scanner
    berat_resi: '',
    berat_aktual: '',
    foto_url_1: '',
    foto_url_2: '',
    catatan: '',
  })

  const selisih = formData.berat_resi && formData.berat_aktual
    ? calculateSelisih(parseFloat(formData.berat_resi), parseFloat(formData.berat_aktual))
    : 0

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/login')
      return
    }

    // Get user data and set nama field
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        const displayName = user.full_name || user.username
        setUserName(displayName)
        setFormData((prev) => ({ ...prev, nama: displayName }))
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }

    // If no_resi was pre-filled from scanner, show success toast
    if (prefilledNoResi) {
      showToast('Barcode berhasil di-scan! ✅', 'success')
    }

    // Fetch earnings settings
    fetchEarningsSettings()
  }, [router])

  // Update no_resi when URL param changes
  useEffect(() => {
    if (prefilledNoResi && prefilledNoResi !== formData.no_resi) {
      setFormData((prev) => ({ ...prev, no_resi: prefilledNoResi }))
    }
  }, [prefilledNoResi])

  const fetchEarningsSettings = async () => {
    try {
      const token = localStorage.getItem('accessToken')

      // Don't make API call if no token available
      if (!token) {
        console.log('No access token available for fetching earnings settings')
        return
      }

      const response = await fetch('/api/settings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Only log errors if it's not a 401 (unauthorized is expected for logged-out users)
      if (!response.ok) {
        if (response.status !== 401) {
          console.error('Error fetching earnings settings:', response.status)
        }
        return
      }

      const data = await response.json()

      if (data.success && data.data) {
        setRatePerEntry(data.data.rate_per_entry)
        setDailyBonus(data.data.daily_bonus)
      }
    } catch (error) {
      console.error('Error fetching earnings settings:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.foto_url_1) {
      showToast('Foto 1 wajib diisi', 'error')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('accessToken')

      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          berat_resi: parseFloat(formData.berat_resi),
          berat_aktual: parseFloat(formData.berat_aktual),
        }),
      })

      const result = await response.json()

      if (result.success) {
        showToast('Entry berhasil dibuat!', 'success')

        // Reset form but keep nama (user name)
        setFormData({
          nama: userName,
          no_resi: '',
          berat_resi: '',
          berat_aktual: '',
          foto_url_1: '',
          foto_url_2: '',
          catatan: '',
        })
      } else {
        showToast(result.message || 'Entry gagal dibuat', 'error')
      }
    } catch (error) {
      console.error('Submit error:', error)
      showToast('Terjadi kesalahan saat membuat entry', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getSelisihColor = (value: number) => {
    const abs = Math.abs(value)
    if (abs < 0.5) return 'text-green-600'
    if (abs < 1) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-3 pb-16">
      <div className="container mx-auto px-3 max-w-4xl">
        <h1 className="text-lg font-bold text-gray-900 mb-3">📦 Entry Baru</h1>

        <div className="card-mobile">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Location Display */}
            <LocationDisplay onLocationFetched={setLocation} />

            {/* No Resi with Scanner */}
            <div>
              <Input
                label="No Resi"
                type="text"
                required
                value={formData.no_resi}
                onChange={(e) => setFormData({ ...formData, no_resi: e.target.value })}
                placeholder="Scan atau masukkan no resi"
                className={prefilledNoResi ? 'border-green-500 bg-green-50' : ''}
              />

              {prefilledNoResi && (
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <span>✅</span>
                  <span>Dari hasil scan barcode</span>
                </p>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setShowScanner(!showScanner)}
              >
                {showScanner ? '✕ Tutup Scanner' : '📷 Scan Barcode'}
              </Button>

              {showScanner && (
                <div className="mt-3">
                  <BarcodeScanner
                    onScan={(code) => {
                      setFormData({ ...formData, no_resi: code })
                      setShowScanner(false)
                      showToast('Barcode berhasil di-scan!', 'success')
                    }}
                    onError={(error) => showToast(error, 'error')}
                  />
                </div>
              )}
            </div>

            {/* Nama Peng-Entry */}
            <Input
              id="nama"
              label="Nama Peng-Entry"
              type="text"
              required
              value={formData.nama}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
              placeholder="Nama peng-entry"
            />

            {/* Berat */}
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Berat Resi (kg)"
                type="number"
                step="0.01"
                required
                value={formData.berat_resi}
                onChange={(e) => setFormData({ ...formData, berat_resi: e.target.value })}
                placeholder="0.00"
              />

              <Input
                label="Berat Aktual (kg)"
                type="number"
                step="0.01"
                required
                value={formData.berat_aktual}
                onChange={(e) => setFormData({ ...formData, berat_aktual: e.target.value })}
                placeholder="0.00"
              />
            </div>

            {/* Selisih Display */}
            {formData.berat_resi && formData.berat_aktual && (
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="text-xs font-semibold text-gray-700 mb-0.5">Selisih:</p>
                <p className={`text-2xl font-bold ${getSelisihColor(selisih)}`}>
                  {selisih >= 0 ? '+' : ''}{selisih} kg
                </p>
              </div>
            )}

            {/* Earnings Preview */}
            <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
              <div className="flex items-center space-x-1.5 mb-2">
                <span className="text-base">💰</span>
                <h3 className="text-xs font-semibold text-gray-800">Earnings Preview</h3>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Per Entry</span>
                  <span className="font-semibold text-gray-800">{formatRupiah(ratePerEntry)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Daily Bonus</span>
                  <span>{formatRupiah(dailyBonus)}</span>
                </div>
                <div className="pt-1.5 mt-1.5 border-t border-green-300">
                  <p className="text-[10px] text-gray-600">
                    💡 Make entries every day to earn the daily bonus!
                  </p>
                </div>
              </div>
            </div>

            {/* Photo Upload */}
            <PhotoUpload
              location={location}
              noResi={formData.no_resi}
              onUpload={(urls) => {
                setFormData({
                  ...formData,
                  foto_url_1: urls.foto_url_1,
                  foto_url_2: urls.foto_url_2 || '',
                })
              }}
            />

            {/* Catatan */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Catatan (Opsional)
              </label>
              <textarea
                value={formData.catatan}
                onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Catatan tambahan..."
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : '💾 Simpan Entry'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
