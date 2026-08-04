import clsx from 'clsx'
import Image from 'next/image'

type LogoTone = 'burgundy' | 'white'

const LOCKUP: Record<LogoTone, string> = {
  burgundy: '/zenthos-lockup-burgundy.png',
  white: '/zenthos-lockup-white.png',
}

const MARK: Record<LogoTone, string> = {
  burgundy: '/zenthos-mark-burgundy.png',
  white: '/zenthos-mark-white.png',
}

export function ZenthosLogo({
  showWordmark = true,
  tone = 'burgundy',
  className,
}: {
  showWordmark?: boolean
  tone?: LogoTone
  className?: string
}) {
  if (!showWordmark) {
    return (
      <span className={clsx('relative block h-9 w-6 shrink-0', className)}>
        <Image src={MARK[tone]} alt="" fill sizes="24px" className="object-contain" />
      </span>
    )
  }

  return (
    <span className={clsx('relative block h-9 w-[116px] shrink-0 md:h-10 md:w-[128px]', className)}>
      <Image
        src={LOCKUP[tone]}
        alt="Zenthos Real Estate"
        fill
        sizes="128px"
        priority
        className="object-contain object-left"
      />
    </span>
  )
}
