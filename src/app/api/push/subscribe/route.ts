import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServiceClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const subscriptionSchema = z.object({
  endpoint: z.url().max(1000),
  keys: z.object({
    p256dh: z.string().min(1).max(500),
    auth: z.string().min(1).max(500),
  }),
})

async function currentUserId(): Promise<string | null> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id ?? null
}

/*
  Subscriptions are keyed on the push endpoint, not on an account. A visitor who
  allows notifications is reachable straight away; if they register later, the
  same row picks up their user id so per-account alerts reach the same device.
*/
export async function POST(request: Request) {
  const parsed = subscriptionSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
  }

  const { endpoint, keys } = parsed.data
  const userId = await currentUserId()
  const supabase = createSupabaseServiceClient()

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      { user_id: userId, endpoint, p256dh: keys.p256dh, auth: keys.auth },
      { onConflict: 'endpoint' }
    )

  if (error) return NextResponse.json({ error: 'Could not save subscription' }, { status: 500 })

  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const parsed = z
    .object({ endpoint: z.url().max(1000) })
    .safeParse(await request.json().catch(() => null))

  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const supabase = createSupabaseServiceClient()
  await supabase.from('push_subscriptions').delete().eq('endpoint', parsed.data.endpoint)

  return NextResponse.json({ ok: true })
}
