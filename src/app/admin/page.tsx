import { Building2, Inbox, Plus } from 'lucide-react'
import Link from 'next/link'
import { ButtonLink } from '@/components/ui/Button'
import { requireAdmin } from '@/lib/auth'
import { formatRelativeTime } from '@/lib/format'
import { countPropertiesByStatus } from '@/lib/queries/admin'
import { countInquiriesByStatus, listInquiries } from '@/lib/queries/inquiries'

export const dynamic = 'force-dynamic'

function StatTile({ label, value, tone }: { label: string; value: number; tone?: 'brand' }) {
  return (
    <div className="border-hairline rounded-card border bg-white p-4">
      <p className="text-muted text-[13px] font-medium">{label}</p>
      <p
        className={
          tone === 'brand'
            ? 'text-brand mt-1 text-[26px] font-extrabold'
            : 'text-ink mt-1 text-[26px] font-extrabold'
        }
      >
        {value}
      </p>
    </div>
  )
}

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin()

  const [propertyCounts, inquiryCounts, recentInquiries] = await Promise.all([
    countPropertiesByStatus(supabase).catch(() => ({
      byStatus: { Available: 0, Sold: 0, Reserved: 0 },
      drafts: 0,
      total: 0,
    })),
    countInquiriesByStatus(supabase).catch(() => ({ New: 0, Contacted: 0, Closed: 0 })),
    listInquiries(supabase)
      .then(all => all.slice(0, 6))
      .catch(() => []),
  ])

  return (
    <div className="app-shell py-6 md:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-title md:text-display text-brand font-extrabold">Dashboard</h1>
        <ButtonLink href="/admin/properties/new">
          <Plus size={17} aria-hidden="true" />
          Add property
        </ButtonLink>
      </div>

      <section className="mt-6">
        <h2 className="text-ink text-[15px] font-bold">Properties</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatTile label="Available" value={propertyCounts.byStatus.Available} tone="brand" />
          <StatTile label="Reserved" value={propertyCounts.byStatus.Reserved} />
          <StatTile label="Sold" value={propertyCounts.byStatus.Sold} />
          <StatTile label="Drafts" value={propertyCounts.drafts} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-ink text-[15px] font-bold">Inquiries</h2>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <StatTile label="New" value={inquiryCounts.New} tone="brand" />
          <StatTile label="Contacted" value={inquiryCounts.Contacted} />
          <StatTile label="Closed" value={inquiryCounts.Closed} />
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-ink text-[15px] font-bold">Recent inquiries</h2>
          <Link href="/admin/inquiries" className="text-brand text-[14px] font-semibold">
            View all
          </Link>
        </div>

        {recentInquiries.length > 0 ? (
          <ul className="border-hairline divide-hairline mt-3 divide-y overflow-hidden rounded-card border">
            {recentInquiries.map(inquiry => (
              <li key={inquiry.id} className="flex items-start gap-3 bg-white p-4">
                <span className="bg-surface text-brand flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                  <Inbox size={16} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-ink text-[14px] font-semibold">{inquiry.name}</p>
                  <p className="text-muted truncate text-[13px]">
                    {inquiry.property?.title ?? 'General enquiry'}
                  </p>
                </div>
                <span className="text-muted shrink-0 text-[12px]">
                  {formatRelativeTime(inquiry.created_at)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="border-hairline text-muted mt-3 rounded-card border bg-white p-6 text-center text-[14px]">
            No inquiries yet.
          </p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-ink text-[15px] font-bold">Quick actions</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Link
            href="/admin/properties/new"
            className="border-hairline hover:border-brand rounded-card flex items-center gap-3 border bg-white p-4 transition-colors"
          >
            <Plus size={18} className="text-brand" aria-hidden="true" />
            <span className="text-ink text-[15px] font-semibold">Add property</span>
          </Link>
          <Link
            href="/admin/properties"
            className="border-hairline hover:border-brand rounded-card flex items-center gap-3 border bg-white p-4 transition-colors"
          >
            <Building2 size={18} className="text-brand" aria-hidden="true" />
            <span className="text-ink text-[15px] font-semibold">All properties</span>
          </Link>
          <Link
            href="/admin/inquiries"
            className="border-hairline hover:border-brand rounded-card flex items-center gap-3 border bg-white p-4 transition-colors"
          >
            <Inbox size={18} className="text-brand" aria-hidden="true" />
            <span className="text-ink text-[15px] font-semibold">View inquiries</span>
          </Link>
        </div>
      </section>
    </div>
  )
}
