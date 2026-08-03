'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'

const roleChange = z.object({
  userId: z.string().uuid(),
  role: z.enum(['buyer', 'agent']),
})

/**
 * Grants or revokes cooperating-broker access. Note what this deliberately
 * cannot do: it never touches `admin_users`, so no amount of agent access
 * confers the right to publish a listing.
 */
export async function setUserRoleAction(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin()

  const parsed = roleChange.safeParse({
    userId: formData.get('userId'),
    role: formData.get('role'),
  })

  if (!parsed.success) return

  await supabase.from('profiles').update({ role: parsed.data.role }).eq('id', parsed.data.userId)

  revalidatePath('/admin/agents')
}
