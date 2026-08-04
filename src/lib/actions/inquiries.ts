'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'
import { INQUIRY_STATUSES } from '@/lib/constants'
import { notifyInquiryUpdated, notifyNewInquiry } from '@/lib/push/notify'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export interface InquiryActionState {
  error?: string
  sent?: boolean
}

const inquirySchema = z.object({
  propertyId: z.string().uuid().nullable(),
  name: z.string().trim().min(1, 'Name is required').max(120),
  email: z.string().trim().email('Enter a valid email').max(200),
  phone: z.string().trim().min(6, 'Enter a valid phone number').max(40),
  message: z.string().trim().max(2000).default(''),
})

export async function submitInquiryAction(
  _previousState: InquiryActionState,
  formData: FormData
): Promise<InquiryActionState> {
  const parsed = inquirySchema.safeParse({
    propertyId: (formData.get('propertyId') as string) || null,
    name: formData.get('name') ?? '',
    email: formData.get('email') ?? '',
    phone: formData.get('phone') ?? '',
    message: formData.get('message') ?? '',
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Please check your details.' }
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('inquiries')
    .insert({
      property_id: parsed.data.propertyId,
      user_id: user?.id ?? null,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      message: parsed.data.message,
      source: 'website',
    })
    .select('id')
    .single()

  if (error) return { error: 'Could not send your enquiry. Please try WhatsApp instead.' }

  let propertyTitle: string | null = null
  if (parsed.data.propertyId) {
    const { data: property } = await supabase
      .from('properties')
      .select('title')
      .eq('id', parsed.data.propertyId)
      .maybeSingle()
    propertyTitle = property?.title ?? null
  }

  await notifyNewInquiry({ id: data.id, name: parsed.data.name, propertyTitle }).catch(
    () => undefined
  )

  return { sent: true }
}

export async function updateInquiryStatusAction(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin()

  const parsed = z
    .object({ id: z.string().uuid(), status: z.enum(INQUIRY_STATUSES) })
    .safeParse({ id: formData.get('id'), status: formData.get('status') })

  if (!parsed.success) return

  const { data, error } = await supabase
    .from('inquiries')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.id)
    .select('user_id, property_id')
    .single()

  if (error) return

  if (parsed.data.status === 'Contacted' && data.user_id) {
    let propertyTitle: string | null = null
    let propertySlug: string | null = null

    if (data.property_id) {
      const { data: property } = await supabase
        .from('properties')
        .select('title, slug')
        .eq('id', data.property_id)
        .maybeSingle()
      propertyTitle = property?.title ?? null
      propertySlug = property?.slug ?? null
    }

    await notifyInquiryUpdated({ userId: data.user_id, propertyTitle, propertySlug }).catch(
      () => undefined
    )
  }

  revalidatePath('/admin/inquiries')
  revalidatePath('/admin')
}
