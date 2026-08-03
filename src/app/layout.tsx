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

// Display face. One weight only — at editorial sizes the serif's own contrast
// does the work, and a second weight would only blunt it.
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} | Luxury Properties in Lagos - Victoria Island, Lekki, Ikoyi, Ajah`,
    template: `%s | ${SITE.name}`,
  },
  description:
    'Browse verified luxury properties for sale, rent and shortlet across Victoria Island, Lekki, Ikoyi and Ajah. Speak to a Zenthos broker on WhatsApp today.',
  applicationName: SITE.name,
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
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
  // Lets the bottom tab bar sit flush against the home indicator on notched phones.
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG" className={`${jakarta.variable} h-full antialiased`}>
      <body className="bg-canvas text-ink flex min-h-full flex-col">{children}</body>
    </html>
  )
}
