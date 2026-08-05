'use client'

import clsx from 'clsx'
import { Building2, ChartNoAxesColumn, Compass, Inbox, Star, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ADMIN_LINKS = [
  { href: '/admin', label: 'Dashboard', Icon: ChartNoAxesColumn, exact: true },
  { href: '/admin/properties', label: 'Properties', Icon: Building2, exact: false },
  { href: '/admin/featured', label: 'Homepage order', Icon: Star, exact: false },
  { href: '/admin/inquiries', label: 'Inquiries', Icon: Inbox, exact: false },
  { href: '/admin/agents', label: 'Agents', Icon: Users, exact: false },
  { href: '/admin/area-guides', label: 'Area guides', Icon: Compass, exact: false },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Admin sections" className="flex gap-1 overflow-x-auto">
      {ADMIN_LINKS.map(({ href, label, Icon, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href)

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={clsx(
              'rounded-control flex h-11 shrink-0 items-center gap-2 px-3.5 text-[14px] font-semibold transition-colors',
              isActive ? 'bg-brand text-brand-ink' : 'text-ink hover:bg-surface'
            )}
          >
            <Icon size={16} aria-hidden="true" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
