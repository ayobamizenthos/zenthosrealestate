import type { Metadata } from 'next'
import Link from 'next/link'
import { InquiryTable } from '@/components/admin/InquiryTable'
import { EmptyState, NoInquiriesIllustration } from '@/components/ui/EmptyState'
import { requireAdmin } from '@/lib/auth'
import { INQUIRY_STATUSES, type InquiryStatus } from '@/lib/constants'
import { listInquiries } from '@/lib/queries/inquiries'

export const metadata: Metadata = { title: 'Inquiries' }
export const dynamic = 'force-dynamic'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function AdminInquiriesPage({ searchParams }: { searchParams: SearchParams }) {
  const { supabase } = await requireAdmin()
  const params = await searchParams

  const rawStatus = Array.isArray(params.status) ? params.status[0] : params.status
  const statusFilter: InquiryStatus | 'All' = (INQUIRY_STATUSES as readonly string[]).includes(
    rawStatus ?? ''
  )
    ? (rawStatus as InquiryStatus)
    : 'All'

  const inquiries = await listInquiries(supabase, statusFilter).catch(() => [])

  return (
    <div className="app-shell py-6 md:py-10">
      <h1 className="text-title md:text-display text-brand font-extrabold">Inquiries</h1>

      <div className="mt-5 flex flex-wrap gap-2">
        {(['All', ...INQUIRY_STATUSES] as const).map(status => {
          const isActive = statusFilter === status
          return (
            <Link
              key={status}
              href={status === 'All' ? '/admin/inquiries' : `/admin/inquiries?status=${status}`}
              aria-current={isActive ? 'page' : undefined}
              className={
                isActive
                  ? 'bg-brand text-brand-ink rounded-control flex h-10 items-center px-3.5 text-[14px] font-semibold'
                  : 'border-hairline text-ink hover:border-brand rounded-control flex h-10 items-center border px-3.5 text-[14px] font-semibold transition-colors'
              }
            >
              {status}
            </Link>
          )
        })}
      </div>

      <div className="mt-6">
        {inquiries.length > 0 ? (
          <InquiryTable inquiries={inquiries} />
        ) : (
          <EmptyState
            illustration={<NoInquiriesIllustration />}
            title="No inquiries here"
            description={
              statusFilter === 'All'
                ? 'Enquiries submitted from the site will appear in this list.'
                : `Nothing with the status "${statusFilter}" right now.`
            }
          />
        )}
      </div>
    </div>
  )
}
