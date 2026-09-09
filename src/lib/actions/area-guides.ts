'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'

const guideSchema = z.object({
  location: z.string().min(1),
  headline: z.string().trim().max(160).default(''),
  overview: z.string().trim().max(2000).default(''),
  estates: z.string().trim().max(2000).default(''),
  shopping: z.string().trim().max(2000).default(''),
  landmarks: z.string().trim().max(2000).default(''),
  getting_around: z.string().trim().max(2000).default(''),
})

export async function saveAreaGuideAction(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin()

  const parsed = guideSchema.safeParse({
    location: formData.get('location'),
    headline: formData.get('headline') ?? '',
    overview: formData.get('overview') ?? '',
    estates: formData.get('estates') ?? '',
    shopping: formData.get('shopping') ?? '',
    landmarks: formData.get('landmarks') ?? '',
    getting_around: formData.get('getting_around') ?? '',
  })

  if (!parsed.success) return

  await supabase
    .from('area_guides')
    .upsert({ ...parsed.data, updated_at: new Date().toISOString() })

  revalidatePath('/admin/area-guides')
  revalidatePath('/properties')
}
