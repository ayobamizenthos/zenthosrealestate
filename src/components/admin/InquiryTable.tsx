'use client'

import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import { updateInquiryStatusAction } from '@/lib/actions/inquiries'
import { INQUIRY_STATUSES } from '@/lib/constants'
import { formatDateTime } from '@/lib/format'
import type { InquiryWithProperty } from '@/lib/types'
import { inquiryReplyLink } from '@/lib/whatsapp'

function InquiryRow({ inquiry }: { inquiry: InquiryWithProperty }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <li className="bg-white">
      <div className="flex flex-wrap items-start gap-x-3 gap-y-2 p-4">
        <button
          type="button"
          onClick={() => setIsExpanded(open => !open)}
          aria-expanded={isExpanded}
          className="min-w-0 flex-1 basis-full text-left sm:basis-0"
        >
          <span className="flex items-center gap-1.5">
            <span className="text-ink text-[15px] font-semibold">{inquiry.name}</span>
            {inquiry.status === 'New' ? (
              <span className="bg-brand rounded-pill px-2 py-0.5 text-[10px] font-bold text-white">
                NEW
              </span>
            ) : null}
            <ChevronDown
              size={15}
              aria-hidden="true"
              className={`text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </span>

          <span className="text-muted mt-0.5 block truncate text-[13px]">
            {inquiry.property ? (
              inquiry.property.title
            ) : (
              <span className="italic">General enquiry</span>
            )}
          </span>

          {!isExpanded && inquiry.message ? (
            <span className="text-muted mt-1 block truncate text-[13px]">{inquiry.message}</span>
          ) : null}
        </button>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <form action={updateInquiryStatusAction}>
            <input type="hidden" name="id" value={inquiry.id} />
            <select
              name="status"
              defaultValue={inquiry.status}
              aria-label={`Status for ${inquiry.name}`}
              onChange={event => event.currentTarget.form?.requestSubmit()}
              className="border-hairline rounded-control h-10 border bg-white px-2.5 text-[16px] font-semibold"
            >
              {INQUIRY_STATUSES.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </form>

          <a
            href={inquiryReplyLink({
              name: inquiry.name,
              phone: inquiry.phone,
              propertyTitle: inquiry.property?.title ?? null,
            })}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Reply to ${inquiry.name} on WhatsApp`}
            className="bg-brand flex h-10 w-10 items-center justify-center rounded-control text-white"
          >
            <WhatsAppIcon className="h-4 w-4" />
          </a>
        </div>
      </div>

      {isExpanded ? (
        <div className="border-hairline bg-surface border-t px-4 py-4">
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-muted text-[12px] font-semibold">Email</dt>
              <dd className="text-ink mt-0.5 text-[14px]">
                <a href={`mailto:${inquiry.email}`} className="hover:text-brand break-all">
                  {inquiry.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-muted text-[12px] font-semibold">Phone</dt>
              <dd className="text-ink mt-0.5 text-[14px]">
                <a href={`tel:${inquiry.phone}`} className="hover:text-brand">
                  {inquiry.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-muted text-[12px] font-semibold">Received</dt>
              <dd className="text-ink mt-0.5 text-[14px]">{formatDateTime(inquiry.created_at)}</dd>
            </div>
          </dl>

          {inquiry.message ? (
            <div className="mt-4">
              <p className="text-muted text-[12px] font-semibold">Message</p>
              <p className="text-ink mt-1 text-[14px] leading-relaxed whitespace-pre-line">
                {inquiry.message}
              </p>
            </div>
          ) : null}

          {inquiry.property ? (
            <Link
              href={`/properties/${inquiry.property.slug}`}
              className="text-brand mt-4 inline-block text-[13px] font-semibold"
            >
              View listing
            </Link>
          ) : null}
        </div>
      ) : null}
    </li>
  )
}

export function InquiryTable({ inquiries }: { inquiries: InquiryWithProperty[] }) {
  return (
    <ul className="border-hairline divide-hairline divide-y overflow-hidden rounded-card border">
      {inquiries.map(inquiry => (
        <InquiryRow key={inquiry.id} inquiry={inquiry} />
      ))}
    </ul>
  )
}
