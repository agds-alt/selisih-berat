'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'

export default function LoginPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
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

        showToast('Login berhasil!', 'success')

        // Redirect to entry page
        router.push('/entry')
      } else {
        showToast(result.message || 'Login gagal', 'error')
      }
    } catch (error) {
      console.error('Login error:', error)
      showToast('Terjadi kesalahan saat login', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Login</h1>
          <p className="text-gray-600 mt-2">Masuk ke akun Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username"
            type="text"
            required
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="Masukkan username"
          />

          <Input
            label="Password"
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Masukkan password"
          />

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Belum punya akun?{' '}
            <Link href="/signup" className="text-primary-600 hover:underline font-semibold">
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
