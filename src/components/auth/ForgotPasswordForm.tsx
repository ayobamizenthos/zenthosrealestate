'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [isSent, setIsSent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    const supabase = createSupabaseBrowserClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setIsSent(true)
    setIsSubmitting(false)
  }

  if (isSent) {
    return (
      <div>
        <h1 className="text-brand text-title font-extrabold">Check your email</h1>
        <p className="text-muted mt-2 text-[15px] leading-relaxed">
          If an account exists for <span className="text-ink font-semibold">{email}</span>, a reset
          link is on its way.
        </p>
        <Link
          href="/login"
          className="text-brand mt-4 inline-flex min-h-11 items-center text-[14px] font-semibold"
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate>
      <h1 className="text-brand text-title font-extrabold">Reset password</h1>
      <p className="text-muted mt-1.5 text-[14px]">
        Enter your email and we&rsquo;ll send you a link to set a new password.
      </p>

      <div className="mt-6">
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={event => setEmail(event.target.value)}
        />
      </div>

      <Button type="submit" fullWidth className="mt-6" disabled={isSubmitting}>
        {isSubmitting ? 'Sending…' : 'Send reset link'}
      </Button>

      <p className="text-muted mt-3 text-center text-[14px]">
        <Link
          href="/login"
          className="text-brand inline-flex min-h-11 items-center px-2 font-semibold"
        >
          Back to sign in
        </Link>
      </p>
    </form>
  )
}
