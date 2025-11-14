'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [location, setLocation] = useState<LocationInfo | null>(null)
  const [ratePerEntry, setRatePerEntry] = useState(500)
  const [dailyBonus, setDailyBonus] = useState(50000)

  const [formData, setFormData] = useState({
    nama: '',
    no_resi: '',
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

    // Fetch earnings settings
    fetchEarningsSettings()
  }, [router])

  const fetchEarningsSettings = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/settings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

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

        // Reset form
        setFormData({
          nama: '',
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">📦 Entry Baru</h1>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
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
              />

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
                <div className="mt-4">
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

            {/* Nama */}
            <Input
              label="Nama"
              type="text"
              required
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              placeholder="Nama penerima"
            />

            {/* Berat */}
            <div className="grid md:grid-cols-2 gap-4">
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
              <div className="p-4 bg-gray-100 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-1">Selisih:</p>
                <p className={`text-3xl font-bold ${getSelisihColor(selisih)}`}>
                  {selisih >= 0 ? '+' : ''}{selisih} kg
                </p>
              </div>
            )}

            {/* Earnings Preview */}
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">💰</span>
                  <h3 className="text-sm font-semibold text-gray-800">Earnings Preview</h3>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Per Entry</span>
                  <span className="font-semibold text-gray-800">{formatRupiah(ratePerEntry)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Daily Bonus (first entry of the day)</span>
                  <span>{formatRupiah(dailyBonus)}</span>
                </div>
                <div className="pt-2 mt-2 border-t border-green-300">
                  <p className="text-xs text-gray-600">
                    💡 Tip: Make entries every day to earn the daily bonus!
                  </p>
                </div>
              </div>
            </div>

            {/* Photo Upload */}
            <PhotoUpload
              location={location}
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
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Catatan (Opsional)
              </label>
              <textarea
                value={formData.catatan}
                onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
        </Card>
      </div>
    </div>
  )
}
