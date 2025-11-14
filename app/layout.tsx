import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/ui/toast'
import { NetworkStatus } from '@/components/ui/network-status'

export const metadata: Metadata = {
  title: 'Weight Entry App - J&T Express',
  description: 'Professional weight tracking for logistics operations. Requires internet connection.',
  manifest: '/manifest.json',
  themeColor: '#dc2626',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'WeightApp',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <head>
        {/* PWA primary color */}
        <meta name="theme-color" content="#dc2626" />

        {/* iOS specific */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="WeightApp" />
        <link rel="apple-touch-icon" href="/icon-192.png" />

        {/* Android specific */}
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-sans antialiased">
        <NetworkStatus />
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
