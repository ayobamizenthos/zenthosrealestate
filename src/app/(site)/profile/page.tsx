import type { Metadata } from 'next'
import { ProfilePanel } from '@/components/profile/ProfilePanel'
import { isUserAdmin, requireUser } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Profile',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const user = await requireUser('/profile')
  const supabase = await createSupabaseServerClient()

  const [{ data: profile }, isAdmin] = await Promise.all([
    supabase.from('profiles').select('full_name, phone').eq('id', user.id).maybeSingle(),
    isUserAdmin(supabase, user.id),
  ])

  return (
    <div className="app-shell max-w-lg py-6 md:py-10">
      <header className="mb-6">
        <h1 className="text-title md:text-display text-brand font-extrabold">Profile</h1>
      </header>

      <ProfilePanel
        fullName={profile?.full_name ?? ''}
        email={user.email ?? ''}
        phone={profile?.phone ?? null}
        isAdmin={isAdmin}
      />
    </div>
  )
}
