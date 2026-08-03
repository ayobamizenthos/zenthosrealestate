import type { InquiryStatus } from '@/lib/constants'
import type { ZenthosSupabaseClient } from '@/lib/supabase/types'
import type { Inquiry, InquiryWithProperty } from '@/lib/types'

const INQUIRY_COLUMNS =
  'id, property_id, user_id, name, email, phone, message, source, status, created_at'

interface InquiryJoinRow {
  id: string
  property_id: string | null
  user_id: string | null
  name: string
  email: string
  phone: string
  message: string
  source: string
  status: string
  created_at: string
  property: { id: string; slug: string; title: string } | null
}

function toInquiry(row: Omit<InquiryJoinRow, 'property'>): Inquiry {
  return {
    id: row.id,
    property_id: row.property_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    source: row.source as Inquiry['source'],
    status: row.status as InquiryStatus,
    created_at: row.created_at,
  }
}

export async function listInquiries(
  supabase: ZenthosSupabaseClient,
  statusFilter: InquiryStatus | 'All' = 'All'
): Promise<InquiryWithProperty[]> {
  let query = supabase
    .from('inquiries')
    .select(`${INQUIRY_COLUMNS}, property:properties(id, slug, title)`)
    .order('created_at', { ascending: false })

  if (statusFilter !== 'All') query = query.eq('status', statusFilter)

  const { data, error } = await query
  if (error) throw new Error(`Failed to load inquiries: ${error.message}`)

  return ((data ?? []) as unknown as InquiryJoinRow[]).map(row => ({
    ...toInquiry(row),
    property: row.property,
  }))
}

export async function countInquiriesByStatus(
  supabase: ZenthosSupabaseClient
): Promise<Record<InquiryStatus, number>> {
  const { data, error } = await supabase.from('inquiries').select('status')
  if (error) throw new Error(`Failed to count inquiries: ${error.message}`)

  const tally: Record<InquiryStatus, number> = { New: 0, Contacted: 0, Closed: 0 }
  for (const row of data ?? []) {
    const status = row.status as InquiryStatus
    if (status in tally) tally[status] += 1
  }
  return tally
}

export async function updateInquiryStatus(
  supabase: ZenthosSupabaseClient,
  inquiryId: string,
  status: InquiryStatus
): Promise<Inquiry> {
  const { data, error } = await supabase
    .from('inquiries')
    .update({ status })
    .eq('id', inquiryId)
    .select(INQUIRY_COLUMNS)
    .single()

  if (error) throw new Error(`Failed to update inquiry: ${error.message}`)
  return toInquiry(data)
}
