import Image from 'next/image'
import clsx from 'clsx'

interface BrandLoaderProps {
  label?: string
  className?: string
}

export function BrandLoader({ label = 'Loading', className }: BrandLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={clsx('flex flex-col items-center justify-center gap-5 py-24', className)}
    >
      <span className="relative flex h-20 w-20 items-center justify-center">
        <span
          aria-hidden="true"
          className="border-hairline border-t-brand absolute inset-0 animate-spin rounded-full border-[3px]"
          style={{ animationDuration: '1.1s' }}
        />
        <span aria-hidden="true" className="animate-brand-pulse relative h-9 w-9">
          <Image
            src="/zenthos-mark-burgundy.png"
            alt=""
            fill
            sizes="36px"
            className="object-contain"
            priority
          />
        </span>
      </span>

      <span className="text-muted text-[13px] font-medium">{label}</span>
    </div>
  )
}
