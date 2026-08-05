'use client'

import clsx from 'clsx'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export interface SelectGroup {
  label: string
  options: readonly string[]
}

export function MultiSelect({
  label,
  placeholder,
  groups,
  selected,
  onChange,
  searchable = false,
  searchPlaceholder = 'Type to filter',
}: {
  label: string
  placeholder: string
  groups: SelectGroup[]
  selected: string[]
  onChange: (next: string[]) => void
  searchable?: boolean
  searchPlaceholder?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [dropUp, setDropUp] = useState(false)
  const [term, setTerm] = useState('')

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeydown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeydown)
    }
  }, [])

  const open = () => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (rect) {
      const below = window.innerHeight - rect.bottom
      setDropUp(below < 340 && rect.top > below)
    }
    setIsOpen(true)
  }

  const toggle = (option: string) => {
    onChange(
      selected.includes(option) ? selected.filter(entry => entry !== option) : [...selected, option]
    )
  }

  const needle = term.trim().toLowerCase()
  const visible = groups
    .map(group => ({
      ...group,
      options: needle
        ? group.options.filter(option => option.toLowerCase().includes(needle))
        : group.options,
    }))
    .filter(group => group.options.length > 0)

  const summary =
    selected.length === 0
      ? placeholder
      : selected.length === 1
        ? selected[0]
        : `${selected.length} selected`

  return (
    <div ref={containerRef} className="relative flex-1 px-4 py-2.5 md:px-5 md:py-3">
      <span className="text-muted block text-[11px] font-bold tracking-wider uppercase">
        {label}
      </span>

      <button
        type="button"
        ref={triggerRef}
        onClick={() => (isOpen ? setIsOpen(false) : open())}
        aria-expanded={isOpen}
        className="mt-0.5 flex min-h-11 w-full items-center justify-between gap-2 text-left"
      >
        <span
          className={clsx(
            'truncate text-[15px] font-semibold',
            selected.length ? 'text-ink' : 'text-muted'
          )}
        >
          {summary}
        </span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={clsx('text-muted shrink-0 transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen ? (
        <div
          className={clsx(
            'animate-fade-in z-50 overflow-hidden bg-white shadow-2xl',
            'fixed inset-x-3 bottom-3 rounded-2xl md:absolute md:inset-x-auto md:bottom-auto md:left-0 md:w-full md:min-w-[16rem] md:rounded-xl',
            dropUp ? 'md:top-auto md:bottom-full md:mb-2' : 'md:top-full md:mt-2'
          )}
        >
          {searchable ? (
            <div className="flex items-center gap-2 px-3 py-2.5">
              <Search size={15} className="text-muted shrink-0" aria-hidden="true" />
              <input
                type="search"
                value={term}
                onChange={event => setTerm(event.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="text-ink placeholder:text-muted h-7 w-full min-w-0 bg-transparent text-[14px] outline-none [&::-webkit-search-cancel-button]:appearance-none"
              />
            </div>
          ) : null}

          <div className="scrollbar-none max-h-[50vh] overflow-y-auto overscroll-contain pb-1 md:max-h-[17rem]">
            {visible.map(group => (
              <div key={group.label}>
                {groups.length > 1 ? (
                  <p className="text-muted px-3 pt-3 pb-1.5 text-[10px] font-bold tracking-[0.14em] uppercase">
                    {group.label}
                  </p>
                ) : null}

                {group.options.map(option => {
                  const checked = selected.includes(option)
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggle(option)}
                      className="hover:bg-surface flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors"
                    >
                      <span
                        aria-hidden="true"
                        className={clsx(
                          'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] transition-colors',
                          checked ? 'bg-brand text-white' : 'bg-surface'
                        )}
                      >
                        {checked ? <Check size={12} strokeWidth={3} /> : null}
                      </span>
                      <span className="text-ink min-w-0 truncate text-[14px]">{option}</span>
                    </button>
                  )
                })}
              </div>
            ))}

            {visible.length === 0 ? (
              <p className="text-muted px-3 py-6 text-center text-[13px]">Nothing matches</p>
            ) : null}
          </div>

          {selected.length > 0 ? (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-muted hover:text-ink hover:bg-surface flex w-full items-center justify-center gap-1.5 py-2.5 text-[13px] font-semibold transition-colors"
            >
              <X size={13} aria-hidden="true" />
              Clear
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
