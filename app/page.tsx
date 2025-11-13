'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('accessToken')
    if (token) {
      router.push('/entry')
    }
  }, [router])

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Sistem Entry Berat
            <span className="block text-primary-600 mt-2">J&T Express</span>
          </h1>

          <p className="text-xl text-gray-700 mb-8">
            Track weight discrepancies with precision
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/entry">
              <Button size="lg" className="w-full sm:w-auto">
                🚀 Mulai Entry
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                🔑 Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-2">Fast Entry</h3>
            <p className="text-gray-600">
              Scan barcode, capture GPS, and upload photos in seconds
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">📸</div>
            <h3 className="text-xl font-bold mb-2">Photo Documentation</h3>
            <p className="text-gray-600">
              Automatic GPS watermark on all photos for accuracy
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2">Earn Rewards</h3>
            <p className="text-gray-600">
              Get paid 500-1500 rupiah per entry based on accuracy
            </p>
          </div>
        </div>

        {/* Stats Showcase */}
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
            Trusted Platform
          </h2>

          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600">25,000+</div>
              <div className="text-sm text-gray-600 mt-1">Entries Processed</div>
            </div>

            <div>
              <div className="text-3xl font-bold text-primary-600">50,000+</div>
              <div className="text-sm text-gray-600 mt-1">Photos Documented</div>
            </div>

            <div>
              <div className="text-3xl font-bold text-primary-600">19+</div>
              <div className="text-sm text-gray-600 mt-1">Active Users</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
