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
          can download full photo sets. They cannot create, edit or delete listings — posting rights
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
        <div className="border-hairline overflow-x-auto rounded-card border bg-white">
          <table className="w-full min-w-[34rem] text-left">
            <thead className="border-hairline bg-surface border-b">
              <tr className="text-muted text-[12px] font-semibold tracking-wide uppercase">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Access</th>
              </tr>
            </thead>
            <tbody className="divide-hairline divide-y">
              {accounts.map(account => {
                const isAgent = account.role === 'agent'
                return (
                  <tr key={account.id}>
                    <td className="px-4 py-3">
                      <span className="text-ink flex items-center gap-2 text-[14px] font-semibold">
                        {isAgent ? (
                          <ShieldCheck size={15} className="text-brand" aria-hidden="true" />
                        ) : (
                          <UserRound size={15} className="text-muted" aria-hidden="true" />
                        )}
                        {account.full_name || 'Unnamed'}
                      </span>
                    </td>
                    <td className="text-muted px-4 py-3 text-[14px]">{account.phone || '—'}</td>
                    <td className="text-muted px-4 py-3 text-[14px]">
                      {formatDate(account.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <form action={setUserRoleAction} className="inline">
                        <input type="hidden" name="userId" value={account.id} />
                        <input type="hidden" name="role" value={isAgent ? 'buyer' : 'agent'} />
                        <button
                          type="submit"
                          className={
                            isAgent
                              ? 'border-brand text-brand hover:bg-surface rounded-pill border px-3.5 py-2 text-[13px] font-semibold transition-colors'
                              : 'border-hairline text-ink hover:border-ink rounded-pill border px-3.5 py-2 text-[13px] font-semibold transition-colors'
                          }
                        >
                          {isAgent ? 'Agent — revoke' : 'Make agent'}
                        </button>
                      </form>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
