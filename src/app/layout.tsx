import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { SITE } from '@/lib/constants'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} | Property for Sale in Lagos`,
    template: `%s | ${SITE.name}`,
  },
  description:
    'Houses, duplexes and apartments for sale across Lagos island and mainland. Every listing inspected, every title checked. Talk to us on WhatsApp.',
  applicationName: SITE.name,
  manifest: '/manifest.webmanifest',
  icons: {
    // 48 first: Google picks the smallest icon that is a multiple of 48 and
    // ignores the 16x16 favicon.ico Next advertises by default.
    icon: [
      { url: '/icons/icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  appleWebApp: {
    capable: true,
    title: SITE.shortName,
    statusBarStyle: 'default',
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    locale: 'en_NG',
    url: SITE.url,
  },
  twitter: { card: 'summary_large_image' },
  // Search Console drops the property if this tag disappears, so it ships with
  // the layout rather than being pasted in and forgotten.
  verification: { google: 'k0qeebDCOJVgtIuqmBMKprsUxjStRQY08tBF_qJP11I' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
}

export const viewport: Viewport = {
  themeColor: '#800020',
  width: 'device-width',
  initialScale: 1,

  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG" className={`${jakarta.variable} h-full antialiased`}>
      <body className="bg-canvas text-ink flex min-h-full flex-col">{children}</body>
    </html>
  )
}
