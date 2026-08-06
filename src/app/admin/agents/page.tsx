import { ShieldCheck, UserRound } from 'lucide-react'
import type { Metadata } from 'next'
import { setUserRoleAction } from '@/lib/actions/agents'
import { requireAdmin } from '@/lib/auth'
import { formatDate } from '@/lib/format'

export const metadata: Metadata = {
  title: 'Agents',
  robots: { index: false, follow: false },
}

interface AccountRow {
  id: string
  full_name: string
  phone: string | null
  role: string
  created_at: string
}

export default async function AgentsPage() {
  const { supabase } = await requireAdmin()

  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, phone, role, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  const accounts: AccountRow[] = data ?? []
  const agentCount = accounts.filter(account => account.role === 'agent').length

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-ink text-[26px] font-extrabold">Agents</h1>
        <p className="text-muted mt-2 max-w-2xl text-[14px] leading-relaxed">
          Cooperating brokers. Agents are alerted to every new listing the moment it publishes, and
          can download full photo sets. They cannot create, edit or delete listings. Posting rights
          come from admin membership, which this screen never grants.
        </p>
        <p className="text-muted mt-3 text-[13px]">
          <span className="text-ink font-bold">{agentCount}</span> of {accounts.length} accounts are
          agents
        </p>
      </header>

      {accounts.length === 0 ? (
        <p className="border-hairline text-muted rounded-card border border-dashed px-4 py-10 text-center text-[14px]">
          No registered accounts yet.
        </p>
      ) : (
        /*
          Phones get one card per account; the four-column table only appears once
          there is room for it. Neither view scrolls sideways.
        */
        <ul className="border-hairline divide-hairline divide-y overflow-hidden rounded-card border bg-white">
          <li className="text-muted bg-surface hidden px-4 py-3 text-[12px] font-semibold tracking-wide uppercase md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1fr)_auto] md:gap-4">
            <span>Name</span>
            <span>Phone</span>
            <span>Joined</span>
            <span className="text-right">Access</span>
          </li>

          {accounts.map(account => {
            const isAgent = account.role === 'agent'

            return (
              <li
                key={account.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3.5 md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1fr)_auto] md:items-center"
              >
                <span className="text-ink flex min-w-0 flex-1 items-center gap-2 text-[14px] font-semibold md:flex-none">
                  {isAgent ? (
                    <ShieldCheck size={15} className="text-brand shrink-0" aria-hidden="true" />
                  ) : (
                    <UserRound size={15} className="text-muted shrink-0" aria-hidden="true" />
                  )}
                  <span className="truncate">{account.full_name || 'Unnamed'}</span>
                </span>

                <span className="text-muted order-last w-full text-[13px] md:order-none md:w-auto md:text-[14px]">
                  <span className="md:hidden">Joined {formatDate(account.created_at)} · </span>
                  {account.phone || 'No phone'}
                </span>

                <span className="text-muted hidden text-[14px] md:block">
                  {formatDate(account.created_at)}
                </span>

                <form action={setUserRoleAction} className="shrink-0 md:text-right">
                  <input type="hidden" name="userId" value={account.id} />
                  <input type="hidden" name="role" value={isAgent ? 'buyer' : 'agent'} />
                  <button
                    type="submit"
                    className={
                      isAgent
                        ? 'border-brand text-brand hover:bg-surface rounded-pill flex h-10 items-center border px-3.5 text-[13px] font-semibold transition-colors'
                        : 'border-hairline text-ink hover:border-ink rounded-pill flex h-10 items-center border px-3.5 text-[13px] font-semibold transition-colors'
                    }
                  >
                    {isAgent ? 'Revoke agent' : 'Make agent'}
                  </button>
                </form>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
