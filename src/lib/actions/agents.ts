'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'

const roleChange = z.object({
  userId: z.string().uuid(),
  role: z.enum(['buyer', 'agent']),
})

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
