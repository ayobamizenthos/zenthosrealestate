import clsx from 'clsx'
import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'whatsapp' | 'ghost' | 'danger'
export type ButtonSize = 'md' | 'lg'

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-brand-ink hover:bg-brand-hover',
  secondary: 'bg-canvas text-brand border-[1.5px] border-brand hover:bg-surface',
  whatsapp: 'bg-brand text-white hover:bg-brand-hover',
  ghost: 'bg-transparent text-brand hover:bg-surface',
  danger: 'bg-danger text-white hover:brightness-90',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: 'h-12 px-5 text-[16px]',
  lg: 'h-14 px-7 text-[17px]',
}

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-control font-semibold ' +
  'transition-colors duration-200 select-none ' +
  'disabled:pointer-events-none disabled:opacity-50 ' +
  'active:opacity-90'

interface SharedButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  className?: string
  children: ReactNode
}

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
}: Omit<SharedButtonProps, 'children'>): string {
  return clsx(
    BASE_CLASSES,
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    fullWidth && 'w-full',
    className
  )
}

type ButtonProps = SharedButtonProps & Omit<ComponentProps<'button'>, 'className' | 'children'>

export function Button({
  variant,
  size,
  fullWidth,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...rest}
    >
      {children}
    </button>
  )
}

type ButtonLinkProps = SharedButtonProps &
  Omit<ComponentProps<typeof Link>, 'className' | 'children'>

export function ButtonLink({
  variant,
  size,
  fullWidth,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link className={buttonClasses({ variant, size, fullWidth, className })} {...rest}>
      {children}
    </Link>
  )
}

type ExternalButtonLinkProps = SharedButtonProps &
  Omit<ComponentProps<'a'>, 'className' | 'children'>

export function ExternalButtonLink({
  variant,
  size,
  fullWidth,
  className,
  children,
  ...rest
}: ExternalButtonLinkProps) {
  return (
    <a
      className={buttonClasses({ variant, size, fullWidth, className })}
      rel="noopener noreferrer"
      {...rest}
    >
      {children}
    </a>
  )
}
