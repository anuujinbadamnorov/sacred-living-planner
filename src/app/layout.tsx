import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Inter, Playfair_Display, Caveat } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/components/AuthProvider'
import ServiceWorkerCleanup from '@/components/ServiceWorkerCleanup'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-playfair',
  display: 'swap',
})

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-caveat',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Sacred Living Planner',
  description: 'Your sacred space for intention, growth, and daily alignment.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Sacred',
    statusBarStyle: 'black-translucent',
    startupImage: [
      { url: '/splash-1290x2796.png', media: '(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)' },
      { url: '/splash-1179x2556.png', media: '(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)' },
      { url: '/splash-1284x2778.png', media: '(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)' },
      { url: '/splash-1170x2532.png', media: '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)' },
      { url: '/splash-1125x2436.png', media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)' },
      { url: '/splash-828x1792.png', media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)' },
      { url: '/splash-750x1334.png', media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)' },
      { url: '/splash-2048x2732.png', media: '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)' },
      { url: '/splash-1668x2388.png', media: '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)' },
      { url: '/splash-1640x2360.png', media: '(device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2)' },
      { url: '/splash-1536x2048.png', media: '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)' },
    ],
  },
  icons: {
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#F6F2EB',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable} ${playfair.variable} ${caveat.variable}`} suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background text-foreground">
        <ThemeProvider defaultTheme="night" storageKey="sacred-theme">
          <AuthProvider>
            {children}
            <ServiceWorkerCleanup />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
