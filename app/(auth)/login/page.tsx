'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'

export default function LoginPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success && result.data) {
        // Save tokens to localStorage
        localStorage.setItem('accessToken', result.data.accessToken)
        localStorage.setItem('refreshToken', result.data.refreshToken)
        localStorage.setItem('user', JSON.stringify(result.data.user))

        // Remember me
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true')
          localStorage.setItem('savedUsername', formData.username)
        }

        showToast('Login berhasil! Selamat datang kembali', 'success')

        // Redirect to entry page
        router.push('/entry')
      } else {
        showToast(result.message || 'Login gagal. Periksa username dan password Anda', 'error')
      }
    } catch (error) {
      console.error('Login error:', error)
      showToast('Terjadi kesalahan saat login. Silakan coba lagi', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center px-4 py-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-100 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="relative bg-white rounded-2xl shadow-2xl p-8 sm:p-10 w-full max-w-md animate-fade-in border border-gray-100">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Image
              src="/icon-192.png"
              alt="Audit Selisih Berat J&T Express"
              width={180}
              height={180}
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Wilujeng Sumping !</h1>
          <p className="text-gray-600">Mangga ka lebet</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Input */}
          <div>
            <Input
              label="Username"
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Masukkan username"
              autoComplete="username"
              disabled={loading}
            />
          </div>

          {/* Password Input with Toggle */}
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Masukkan password"
              autoComplete="current-password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              )}
            </button>
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
              disabled={loading}
            />
            <label htmlFor="remember-me" className="ml-2 text-sm text-gray-700 select-none cursor-pointer">
              Ingat saya
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Masuk'}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-4 text-sm text-gray-500">atau</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        {/* Signup Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Belum punya akun?{' '}
            <Link
              href="/signup"
              className="text-red-600 hover:text-red-700 font-semibold hover:underline transition-colors"
            >
              Daftar Sekarang
            </Link>
          </p>
        </div>

        {/* Footer Info */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            Audit Selisih Berat J&T Express
          </p>
        </div>
      </div>
    </div>
  )
}
