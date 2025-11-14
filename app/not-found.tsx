'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Animation */}
        <div className="mb-8 relative">
          <div className="text-9xl font-bold text-red-600 opacity-10 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-7xl animate-bounce">
              🔍
            </div>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Halaman Tidak Ditemukan
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>

        {/* Suggestions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Saran untuk Anda:
          </h2>
          <ul className="text-left space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Periksa kembali URL yang Anda masukkan</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Gunakan menu navigasi untuk menemukan halaman yang Anda cari</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Kembali ke beranda dan mulai dari awal</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl"
          >
            🏠 Kembali ke Beranda
          </Link>

          <button
            onClick={() => window.history.back()}
            className="block w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            ← Halaman Sebelumnya
          </button>
        </div>

        {/* Quick Links */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3">Halaman Populer:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              href="/entry"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
            >
              Entry
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/leaderboard"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
            >
              Leaderboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
