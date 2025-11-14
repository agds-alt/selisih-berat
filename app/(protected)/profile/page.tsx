'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'

interface UserProfile {
  username: string
  email: string | null
  full_name: string | null
  role: string
  created_at: string
  last_login: string | null
  is_active: boolean
}

export default function ProfilePage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    full_name: ''
  })

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/login')
      return
    }

    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const username = localStorage.getItem('userName')

      const response = await fetch(`/api/users/${username}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const result = await response.json()
      if (result.success) {
        setProfile(result.data)
        setFormData({
          email: result.data.email || '',
          full_name: result.data.full_name || ''
        })
      }
    } catch (error) {
      console.error('Fetch profile error:', error)
      showToast('Gagal memuat profil', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const token = localStorage.getItem('accessToken')
      const username = localStorage.getItem('userName')

      const response = await fetch(`/api/users/${username}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()
      if (result.success) {
        showToast('Profil berhasil diupdate!', 'success')
        setEditMode(false)
        fetchProfile()
      } else {
        showToast(result.message || 'Update gagal', 'error')
      }
    } catch (error) {
      console.error('Update error:', error)
      showToast('Terjadi kesalahan', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="px-3 py-3 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-3">
          <h1 className="text-lg font-bold text-gray-900">👤 Profil Saya</h1>
          <p className="text-xs text-gray-600">Kelola informasi akun Anda</p>
        </div>

        {profile && (
          <div className="space-y-3">
            {/* Profile Info Card */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900">Informasi Akun</h2>
                {!editMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditMode(true)}
                  >
                    ✏️ Edit
                  </Button>
                )}
              </div>

              {editMode ? (
                <form onSubmit={handleUpdate} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={profile.username}
                      disabled
                      className="w-full px-3 py-2 text-sm bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">Username tidak dapat diubah</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Nama lengkap"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="flex-1"
                    >
                      {saving ? 'Menyimpan...' : '💾 Simpan'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditMode(false)
                        setFormData({
                          email: profile.email || '',
                          full_name: profile.full_name || ''
                        })
                      }}
                      disabled={saving}
                    >
                      Batal
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-600">Username</p>
                    <p className="text-sm font-medium text-gray-900">{profile.username}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Email</p>
                    <p className="text-sm font-medium text-gray-900">{profile.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Nama Lengkap</p>
                    <p className="text-sm font-medium text-gray-900">{profile.full_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Role</p>
                    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${
                      profile.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {profile.role === 'admin' ? '👑 Admin' : '👤 User'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Member Since</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(profile.created_at).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </Card>

            {/* Security Card */}
            <Card className="p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">🔒 Keamanan</h2>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/profile/change-password')}
              >
                🔑 Ubah Password
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
