'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { PhotoGrid, Photo } from '@/components/photos/photo-grid'
import { PhotoModal } from '@/components/photos/photo-modal'
import { PhotoFiltersComponent, PhotoFilters } from '@/components/photos/photo-filters'
import { BulkActions } from '@/components/photos/bulk-actions'
import { downloadPhotosAsZipBatched, formatBytes } from '@/lib/utils/zip'
import { useToast } from '@/components/ui/toast'

interface Stats {
  totalPhotos: number
  uploadedToday: number
  estimatedSize: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function FotoManagementPage() {
  const router = useRouter()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())
  const [stats, setStats] = useState<Stats>({
    totalPhotos: 0,
    uploadedToday: 0,
    estimatedSize: 0,
  })
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 500,
    total: 0,
    totalPages: 0,
  })
  const [filters, setFilters] = useState<PhotoFilters>({
    startDate: '',
    endDate: '',
    search: '',
  })
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<{
    show: boolean
    current: number
    total: number
    percentage: number
    message: string
  }>({
    show: false,
    current: 0,
    total: 0,
    percentage: 0,
    message: '',
  })

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const user = localStorage.getItem('user')

    if (!token) {
      router.push('/login')
      return
    }

    // Check if user is admin
    if (user) {
      const userData = JSON.parse(user)
      if (userData.role !== 'admin') {
        showToast('Access denied: Admin only', 'error')
        router.push('/dashboard')
        return
      }
    }

    fetchPhotos()
  }, [router, pagination.page, pagination.limit])

  const fetchPhotos = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.search && { search: filters.search }),
      })

      const response = await fetch(`/api/photos?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (result.success) {
        setPhotos(result.data.photos)
        setPagination(result.data.pagination)
        setStats({
          totalPhotos: result.data.stats.totalPhotos,
          uploadedToday: result.data.stats.uploadedToday,
          estimatedSize: result.data.stats.totalPhotos * 500000, // Estimate 500KB per photo
        })
      } else {
        showToast(result.message || 'Failed to fetch photos', 'error')
      }
    } catch (error) {
      console.error('Error fetching photos:', error)
      showToast('Failed to fetch photos', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters: PhotoFilters) => {
    setFilters(newFilters)
    setPagination({ ...pagination, page: 1 })
    // Trigger fetch in useEffect
    setTimeout(() => fetchPhotos(), 100)
  }

  const handleFilterReset = () => {
    setFilters({
      startDate: '',
      endDate: '',
      search: '',
    })
    setPagination({ ...pagination, page: 1 })
    setTimeout(() => fetchPhotos(), 100)
  }

  const handlePhotoSelect = (photoId: string, selected: boolean) => {
    const newSelected = new Set(selectedPhotos)
    if (selected) {
      newSelected.add(photoId)
    } else {
      newSelected.delete(photoId)
    }
    setSelectedPhotos(newSelected)
  }

  const handleSelectAll = () => {
    const allIds = new Set(photos.map((p) => p.id))
    setSelectedPhotos(allIds)
  }

  const handleUnselectAll = () => {
    setSelectedPhotos(new Set())
  }

  const handleDownloadZip = async () => {
    const selectedPhotosList = photos.filter((p) => selectedPhotos.has(p.id))

    if (selectedPhotosList.length === 0) {
      showToast('No photos selected', 'error')
      return
    }

    setIsProcessing(true)
    setDownloadProgress({
      show: true,
      current: 0,
      total: selectedPhotosList.length,
      percentage: 0,
      message: 'Starting download...',
    })

    try {
      const photoUrls = selectedPhotosList.map((p) => p.url)
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `photos_${timestamp}.zip`

      await downloadPhotosAsZipBatched(photoUrls, filename, 100, (progress) => {
        setDownloadProgress({
          show: true,
          current: progress.current,
          total: progress.total,
          percentage: progress.percentage,
          message: progress.currentFile,
        })
      })

      showToast('Photos downloaded successfully!', 'success')
      setDownloadProgress({ show: false, current: 0, total: 0, percentage: 0, message: '' })
    } catch (error: any) {
      console.error('Error downloading photos:', error)
      showToast(`Failed to download photos: ${error.message}`, 'error')
      setDownloadProgress({ show: false, current: 0, total: 0, percentage: 0, message: '' })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteSelected = async () => {
    const selectedCount = selectedPhotos.size

    if (selectedCount === 0) {
      showToast('No photos selected', 'error')
      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedCount} photo(s)? This action cannot be undone.`
    )

    if (!confirmed) return

    setIsProcessing(true)

    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/photos', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          photoIds: Array.from(selectedPhotos),
        }),
      })

      const result = await response.json()

      if (result.success) {
        showToast(result.message || 'Photos deleted successfully!', 'success')
        setSelectedPhotos(new Set())
        fetchPhotos()
      } else {
        showToast(result.message || 'Failed to delete photos', 'error')
      }
    } catch (error: any) {
      console.error('Error deleting photos:', error)
      showToast(`Failed to delete photos: ${error.message}`, 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return
    setPagination({ ...pagination, page: newPage })
  }

  if (loading && photos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">📸 Photo Management</h1>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>

          {/* Grid Skeleton */}
          <Card>
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">📸 Photo Management</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="p-6">
              <div className="text-sm font-medium text-gray-600 mb-1">Total Photos</div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalPhotos.toLocaleString()}</div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="text-sm font-medium text-gray-600 mb-1">Selected</div>
              <div className="text-2xl font-bold text-primary-600">{selectedPhotos.size}</div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="text-sm font-medium text-gray-600 mb-1">Uploaded Today</div>
              <div className="text-2xl font-bold text-green-600">{stats.uploadedToday}</div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="text-sm font-medium text-gray-600 mb-1">Estimated Size</div>
              <div className="text-2xl font-bold text-blue-600">{formatBytes(stats.estimatedSize)}</div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <PhotoFiltersComponent onFilterChange={handleFilterChange} onReset={handleFilterReset} />

        {/* Bulk Actions */}
        <BulkActions
          selectedCount={selectedPhotos.size}
          totalCount={photos.length}
          onSelectAll={handleSelectAll}
          onUnselectAll={handleUnselectAll}
          onDownloadZip={handleDownloadZip}
          onDeleteSelected={handleDeleteSelected}
          isProcessing={isProcessing}
        />

        {/* Photo Grid */}
        <Card className="mb-6">
          <div className="p-6">
            <PhotoGrid
              photos={photos}
              selectedPhotos={selectedPhotos}
              onPhotoClick={(photo) => setSelectedPhoto(photo)}
              onPhotoSelect={handlePhotoSelect}
            />
          </div>
        </Card>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {(pagination.page - 1) * pagination.limit + 1} -{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <div className="flex gap-1">
                    {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                      const pageNum = i + 1
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-4 py-2 rounded-lg ${
                            pagination.page === pageNum
                              ? 'bg-primary-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <PhotoModal
          isOpen={!!selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          photoUrl={selectedPhoto.url}
          metadata={{
            nama: selectedPhoto.nama,
            no_resi: selectedPhoto.no_resi,
            created_at: selectedPhoto.created_at,
            created_by: selectedPhoto.created_by,
          }}
        />
      )}

      {/* Download Progress Modal */}
      {downloadProgress.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Downloading Photos...</h3>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>
                    {downloadProgress.current} / {downloadProgress.total}
                  </span>
                  <span>{downloadProgress.percentage}%</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-primary-600 h-full transition-all duration-300"
                    style={{ width: `${downloadProgress.percentage}%` }}
                  ></div>
                </div>
              </div>

              <p className="text-sm text-gray-600 truncate">{downloadProgress.message}</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
