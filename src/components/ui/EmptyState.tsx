import type { ReactNode } from 'react'

interface EmptyStateProps {
  illustration: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ illustration, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="text-brand/30 mb-5">{illustration}</div>
      <h2 className="text-ink text-[17px] font-bold">{title}</h2>
      <p className="text-muted mt-1.5 max-w-xs text-[14px]">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}

export function NoResultsIllustration() {
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 72 72"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 34 36 13l26 21" />
      <path d="M17 30v27h38V30" />
      <path d="M29 57V41h14v16" />
      <circle cx="49" cy="49" r="12" fill="white" />
      <path d="m58 58 7 7" />
      <path d="m45 45 8 8m0-8-8 8" />
    </svg>
  )
}

export function NoSavedIllustration() {
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 72 72"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M36 60S12 46 12 30a13 13 0 0 1 24-7 13 13 0 0 1 24 7c0 16-24 30-24 30Z" />
    </svg>
  )
}

export function NoInquiriesIllustration() {
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 72 72"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="17" width="54" height="38" rx="4" />
      <path d="m9 22 27 18 27-18" />
    </svg>
  )
}
