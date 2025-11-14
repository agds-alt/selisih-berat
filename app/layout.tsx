import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/ui/toast'
import { NetworkStatus } from '@/components/ui/network-status'

export const metadata: Metadata = {
  title: 'Weight Entry App - J&T Express',
  description: 'Professional weight tracking for logistics operations',
  manifest: '/manifest.json',
  themeColor: '#dc2626',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="font-sans antialiased">
        <NetworkStatus />
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
