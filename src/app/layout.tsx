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
