'use client'

import { useState, useEffect } from 'react'

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Check if already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches
    if (isInstalled) return

    // Check if prompt was dismissed recently (within 7 days)
    const dismissedAt = localStorage.getItem('installPromptDismissed')
    if (dismissedAt) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24)
      if (daysSinceDismissed < 7) return
    }

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)

      // Show prompt after 5 seconds
      setTimeout(() => {
        setShowPrompt(true)
      }, 5000)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    console.log(`User ${outcome === 'accepted' ? 'accepted' : 'dismissed'} install`)

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Don't show again for 7 days
    localStorage.setItem('installPromptDismissed', Date.now().toString())
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-20 left-3 right-3 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-lg shadow-2xl p-4 z-[60] animate-slide-up md:max-w-md md:left-auto md:right-6">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-xs hover:bg-opacity-30 transition-colors"
        aria-label="Dismiss install prompt"
      >
        ✕
      </button>

      <div className="flex items-start gap-3">
        <span className="text-3xl">📱</span>
        <div className="flex-1">
          <h3 className="text-sm font-bold mb-1">Install Aplikasi</h3>
          <p className="text-xs opacity-90 mb-3">
            Install ke home screen untuk akses lebih cepat!
          </p>
          <button
            onClick={handleInstall}
            className="w-full bg-white text-primary-600 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-colors active:scale-95"
            style={{ minHeight: '44px' }}
          >
            Install Sekarang
          </button>
        </div>
      </div>
    </div>
  )
}
