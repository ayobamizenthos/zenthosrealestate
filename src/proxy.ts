import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { findLocationLanding } from '@/lib/constants'
import { isSupabaseConfigured, publicEnv } from '@/lib/env'

const PROTECTED_PREFIXES = ['/profile', '/admin']

const SLUG_CACHE_TTL_MS = 300_000
const knownSlugs = new Map<string, number>()

// Next cannot set a 404 status once a page has begun streaming, so an unknown
// listing would otherwise render "not found" behind a 200. Resolving the slug
// here, before rendering starts, lets the router emit a real 404. Confirmed
// slugs are held in memory so valid listings never pay for the lookup.
async function listingExists(slug: string): Promise<boolean> {
  const cachedUntil = knownSlugs.get(slug)
  if (cachedUntil && cachedUntil > Date.now()) return true

  const endpoint = `${publicEnv.supabaseUrl}/rest/v1/properties?select=slug&published=is.true&slug=eq.${encodeURIComponent(slug)}&limit=1`

  const response = await fetch(endpoint, {
    headers: {
      apikey: publicEnv.supabaseAnonKey,
      Authorization: `Bearer ${publicEnv.supabaseAnonKey}`,
    },
  })

  if (!response.ok) return true

  const rows: unknown = await response.json()
  const found = Array.isArray(rows) && rows.length > 0
  if (found) knownSlugs.set(slug, Date.now() + SLUG_CACHE_TTL_MS)

  return found
}

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request })

  if (!isSupabaseConfigured) return response

  const supabase = createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options)
        }
      },
    },
  })

  // Refreshes the auth token and writes the cookies onto `response`. Must run
  // before the redirect decision below or the session read is stale.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const needsAuth = PROTECTED_PREFIXES.some(
    prefix => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )

  if (needsAuth && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const listingSlug = pathname.match(/^\/properties\/([^/]+)\/?$/)?.[1]
  if (listingSlug && !findLocationLanding(listingSlug) && !(await listingExists(listingSlug))) {
    return NextResponse.rewrite(new URL('/listing-unavailable', request.url))
  }

  return response
}

export const config = {
  matcher: [
    // Everything except static assets, the service worker and image files.
    '/((?!_next/static|_next/image|favicon.ico|icons/|sw.js|manifest.webmanifest|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)',
  ],
}
