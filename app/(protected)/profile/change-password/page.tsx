'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'

export default function ChangePasswordPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const getPasswordStrength = (password: string): { strength: string; color: string } => {
    if (password.length === 0) return { strength: '', color: '' }
    if (password.length < 6) return { strength: 'Lemah', color: 'text-red-600' }
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      return { strength: 'Sedang', color: 'text-yellow-600' }
    }
    if (/[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: 'Kuat', color: 'text-green-600' }
    }
    return { strength: 'Sedang', color: 'text-yellow-600' }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (formData.new_password !== formData.confirm_password) {
      showToast('Password baru tidak cocok', 'error')
      return
    }

    if (formData.new_password.length < 6) {
      showToast('Password minimal 6 karakter', 'error')
      return
    }

    if (!/[A-Za-z]/.test(formData.new_password)) {
      showToast('Password harus mengandung huruf', 'error')
      return
    }

    if (!/[0-9]/.test(formData.new_password)) {
      showToast('Password harus mengandung angka', 'error')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('accessToken')

      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          old_password: formData.old_password,
          new_password: formData.new_password
        })
      })

      const result = await response.json()

      if (result.success) {
        showToast('Password berhasil diubah!', 'success')
        setTimeout(() => {
          router.push('/profile')
        }, 1500)
      } else {
        showToast(result.message || 'Gagal mengubah password', 'error')
      }
    } catch (error) {
      console.error('Change password error:', error)
      showToast('Terjadi kesalahan', 'error')
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = getPasswordStrength(formData.new_password)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="px-3 py-3 max-w-md mx-auto">
        {/* Header */}
        <div className="mb-3 flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-300 hover:bg-gray-50"
          >
            ←
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">🔑 Ubah Password</h1>
            <p className="text-xs text-gray-600">Pastikan password baru Anda kuat</p>
          </div>
        </div>

        <Card className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Password Saat Ini
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={formData.old_password}
                  onChange={(e) => setFormData({ ...formData, old_password: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.current ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Password Baru
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={formData.new_password}
                  onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.new ? '🙈' : '👁️'}
                </button>
              </div>
              {formData.new_password && (
                <p className={`text-xs mt-1 font-medium ${passwordStrength.color}`}>
                  Kekuatan: {passwordStrength.strength}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.confirm ? '🙈' : '👁️'}
                </button>
              </div>
              {formData.confirm_password && formData.new_password !== formData.confirm_password && (
                <p className="text-xs text-red-600 mt-1">Password tidak cocok</p>
              )}
            </div>

            {/* Requirements */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-medium text-blue-900 mb-2">Syarat password:</p>
              <ul className="text-[10px] text-blue-700 space-y-1">
                <li>✓ Minimal 6 karakter</li>
                <li>✓ Mengandung huruf</li>
                <li>✓ Mengandung angka</li>
                <li>💡 Rekomendasi: Gunakan kombinasi huruf besar, kecil, dan angka</li>
              </ul>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading || formData.new_password !== formData.confirm_password}
              className="w-full"
            >
              {loading ? 'Memproses...' : '🔒 Ubah Password'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
