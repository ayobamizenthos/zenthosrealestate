import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isSupabaseConfigured, publicEnv } from '@/lib/env'

const PROTECTED_PREFIXES = ['/saved', '/compare', '/profile', '/notifications', '/admin']

/**
 * Next 16 renamed the middleware convention to `proxy`. This refreshes the
 * Supabase session cookie on every request and gates the signed-in routes.
 */
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

  return response
}

export const config = {
  matcher: [
    // Everything except static assets, the service worker and image files.
    '/((?!_next/static|_next/image|favicon.ico|icons/|sw.js|manifest.webmanifest|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)',
  ],
}
