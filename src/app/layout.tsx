import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/components/AuthProvider';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import PWAProvider from '@/components/PWAProvider';
import RealtimeSyncProvider from '@/components/RealtimeSyncProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sacred Living Planner',
  description: 'Your sacred space for intention, growth, and daily alignment.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Sacred Living',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FAF7F2',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className="antialiased min-h-screen">
        <AuthProvider>
          <ThemeProvider>
            <PWAProvider>
              <RealtimeSyncProvider>{children}</RealtimeSyncProvider>
            </PWAProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
