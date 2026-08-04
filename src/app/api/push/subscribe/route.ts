import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const subscriptionSchema = z.object({
  endpoint: z.string().url().max(1000),
  keys: z.object({
    p256dh: z.string().min(1).max(500),
    auth: z.string().min(1).max(500),
  }),
})

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

  const parsed = subscriptionSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
  }

  const { endpoint, keys } = parsed.data

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      { user_id: user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth },
      { onConflict: 'endpoint' }
    )

  if (error) return NextResponse.json({ error: 'Could not save subscription' }, { status: 500 })

  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

  const parsed = z
    .object({ endpoint: z.string().url().max(1000) })
    .safeParse(await request.json().catch(() => null))

  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', user.id)
    .eq('endpoint', parsed.data.endpoint)

  return NextResponse.json({ ok: true })
}
