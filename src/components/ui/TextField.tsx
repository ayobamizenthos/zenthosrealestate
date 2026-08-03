import clsx from 'clsx'
import type { ComponentProps } from 'react'

interface TextFieldProps extends Omit<ComponentProps<'input'>, 'className'> {
  label: string
  hint?: string
  error?: string
}

export function TextField({ label, hint, error, id, ...rest }: TextFieldProps) {
  const fieldId = id ?? rest.name
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined

  return (
    <div>
      <label htmlFor={fieldId} className="text-ink block text-[14px] font-semibold">
        {label}
      </label>
      <input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={clsx(
          'rounded-control mt-1.5 h-12 w-full border px-3.5 text-[16px] outline-none transition-colors',
          error ? 'border-danger' : 'border-hairline focus:border-brand'
        )}
        {...rest}
      />
      {error ? (
        <p id={`${fieldId}-error`} className="text-danger mt-1.5 text-[13px]">
          {error}
        </p>
      ) : hint ? (
        <p id={`${fieldId}-hint`} className="text-muted mt-1.5 text-[13px]">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export function TextArea({
  label,
  hint,
  error,
  id,
  ...rest
}: Omit<ComponentProps<'textarea'>, 'className'> & {
  label: string
  hint?: string
  error?: string
}) {
  const fieldId = id ?? rest.name

  return (
    <div>
      <label htmlFor={fieldId} className="text-ink block text-[14px] font-semibold">
        {label}
      </label>
      <textarea
        id={fieldId}
        aria-invalid={error ? true : undefined}
        className={clsx(
          'rounded-control mt-1.5 w-full border px-3.5 py-3 text-[16px] outline-none transition-colors',
          error ? 'border-danger' : 'border-hairline focus:border-brand'
        )}
        {...rest}
      />
      {error ? (
        <p className="text-danger mt-1.5 text-[13px]">{error}</p>
      ) : hint ? (
        <p className="text-muted mt-1.5 text-[13px]">{hint}</p>
      ) : null}
    </div>
  )
}

export function SelectField({
  label,
  error,
  id,
  children,
  ...rest
}: Omit<ComponentProps<'select'>, 'className'> & { label: string; error?: string }) {
  const fieldId = id ?? rest.name

  return (
    <div>
      <label htmlFor={fieldId} className="text-ink block text-[14px] font-semibold">
        {label}
      </label>
      <select
        id={fieldId}
        className={clsx(
          'rounded-control mt-1.5 h-12 w-full border bg-white px-3 text-[16px] outline-none transition-colors',
          error ? 'border-danger' : 'border-hairline focus:border-brand'
        )}
        {...rest}
      >
        {children}
      </select>
      {error ? <p className="text-danger mt-1.5 text-[13px]">{error}</p> : null}
    </div>
  )
}
