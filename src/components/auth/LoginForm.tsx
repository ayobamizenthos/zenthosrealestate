'use client'

import { LoaderCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const nextPath = searchParams.get('next') ?? '/'

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')

    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setErrorMessage(
        error.message === 'Invalid login credentials'
          ? 'That email and password combination does not match an account.'
          : error.message
      )
      setIsSubmitting(false)
      return
    }

    router.replace(nextPath)
    router.refresh()
  }

  return (
    <form onSubmit={submit} noValidate>
      <h1 className="text-brand text-title font-extrabold">Sign in</h1>
      <p className="text-muted mt-1.5 text-[14px]">
        Save properties, compare listings and get alerts when prices move.
      </p>

      <div className="mt-6 space-y-4">
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={event => setEmail(event.target.value)}
        />

        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={event => setPassword(event.target.value)}
        />
      </div>

      {errorMessage ? (
        <p role="alert" className="text-danger mt-4 text-[14px]">
          {errorMessage}
        </p>
      ) : null}

      <Button type="submit" fullWidth className="mt-6" disabled={isSubmitting}>
        {isSubmitting ? (
          <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
        ) : null}
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </Button>

      <div className="mt-3 flex items-center justify-between text-[14px]">
        <Link
          href="/forgot-password"
          className="text-muted hover:text-brand -mx-1 inline-flex min-h-11 items-center px-1 transition-colors"
        >
          Forgot password?
        </Link>
        <Link
          href={`/register?next=${encodeURIComponent(nextPath)}`}
          className="text-brand -mx-1 inline-flex min-h-11 items-center px-1 font-semibold"
        >
          Create account
        </Link>
      </div>
    </form>
  )
}
