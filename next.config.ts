import withSerwistInit from '@serwist/next'
import type { NextConfig } from 'next'

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  // A service worker in dev caches stale routes and makes HMR lie to you.
  disable: process.env.NODE_ENV === 'development',
  reloadOnOnline: true,
})

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
]

const nextConfig: NextConfig = {
  // A stray lockfile in the user profile makes Next infer the wrong workspace
  // root, which breaks output file tracing on deploy.
  outputFileTracingRoot: process.cwd(),
  images: {
    // Cloudinary already stores and transforms the originals; routing through
    // Vercel's optimizer would burn free-tier quota to produce the same bytes.
    loader: 'custom',
    loaderFile: './src/lib/cloudinary-loader.ts',
    deviceSizes: [375, 390, 414, 768, 1024, 1200, 1600, 1920],
    imageSizes: [24, 96, 160, 200, 320, 400],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  poweredByHeader: false,
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        source: '/sw.js',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }],
      },
    ]
  },
}

export default withSerwist(nextConfig)
