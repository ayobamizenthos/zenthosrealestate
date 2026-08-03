import clsx from 'clsx'
import Image from 'next/image'

/**
 * The supplied artwork is a single lockup (monogram + wordmark), so the header
 * sizes it by height and lets the width follow. `showWordmark={false}` crops to
 * the monogram for tight spots like the install banner.
 */
export function ZenthosLogo({
  showWordmark = true,
  className,
}: {
  showWordmark?: boolean
  className?: string
}) {
  if (!showWordmark) {
    return (
      <span className={clsx('relative block h-9 w-9 shrink-0', className)}>
        <Image
          src="/icons/icon-192.png"
          alt=""
          fill
          sizes="36px"
          className="rounded-lg object-contain"
        />
      </span>
    )
  }

  return (
    <span className={clsx('relative block h-8 w-[132px] shrink-0 md:h-9 md:w-[150px]', className)}>
      <Image
        src="/zenthos-wordmark.png"
        alt="Zenthos Real Estate"
        fill
        sizes="150px"
        priority
        className="object-contain object-left"
      />
    </span>
  )
}
