/**
 * NEXT_PUBLIC_* values must be referenced as literal `process.env.X` expressions
 * for Next to inline them into the client bundle — destructuring or dynamic
 * lookup silently yields undefined in the browser.
 */
export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  cloudinaryCloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? '',
  cloudinaryUploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? '',
  vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '',
} as const

export const serverEnv = {
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY ?? '',
  vapidSubject: process.env.VAPID_SUBJECT ?? 'mailto:hello@zenthosrealestate.com.ng',
} as const

export const isSupabaseConfigured = Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey)
export const isCloudinaryConfigured = Boolean(
  publicEnv.cloudinaryCloudName && publicEnv.cloudinaryUploadPreset
)
export const isPushConfigured = Boolean(publicEnv.vapidPublicKey && serverEnv.vapidPrivateKey)

/** Fails loudly at the point of use rather than producing a confusing 401 later. */
export function assertSupabaseConfigured(): void {
  if (isSupabaseConfigured) return
  throw new Error(
    'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (see .env.example).'
  )
}

export function assertServiceRoleConfigured(): void {
  assertSupabaseConfigured()
  if (serverEnv.supabaseServiceRoleKey) return
  throw new Error(
    'SUPABASE_SERVICE_ROLE_KEY is not set. It is required for notification fan-out and admin seeding.'
  )
}
