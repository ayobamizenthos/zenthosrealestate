'use client'

import { LoaderCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

const MIN_PASSWORD_LENGTH = 8

export function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [needsVerification, setNeedsVerification] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const nextPath = searchParams.get('next') ?? '/'

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (password.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    const supabase = createSupabaseBrowserClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone },
        emailRedirectTo: `${window.location.origin}${nextPath}`,
      },
    })

    if (error) {
      setErrorMessage(error.message)
      setIsSubmitting(false)
      return
    }

    if (data.session) {
      router.replace(nextPath)
      router.refresh()
      return
    }

    setNeedsVerification(true)
    setIsSubmitting(false)
  }

  if (needsVerification) {
    return (
      <div>
        <h1 className="text-brand text-title font-extrabold">Check your email</h1>
        <p className="text-muted mt-2 text-[15px] leading-relaxed">
          We sent a confirmation link to <span className="text-ink font-semibold">{email}</span>.
          Open it to finish setting up your account.
        </p>
        <Link href="/" className="text-brand mt-6 inline-block text-[14px] font-semibold">
          Back to home
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate>
      <h1 className="text-brand text-title font-extrabold">Create account</h1>
      <p className="text-muted mt-1.5 text-[14px]">
        Takes a minute. We never share your details with third parties.
      </p>

      <div className="mt-6 space-y-4">
        <TextField
          label="Full name"
          name="fullName"
          autoComplete="name"
          required
          value={fullName}
          onChange={event => setFullName(event.target.value)}
        />

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
          label="Phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="0811 538 3780"
          required
          value={phone}
          onChange={event => setPhone(event.target.value)}
        />

        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
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
        {isSubmitting ? 'Creating account…' : 'Create account'}
      </Button>

      <p className="text-muted mt-5 text-center text-[14px]">
        Already have an account?{' '}
        <Link
          href={`/login?next=${encodeURIComponent(nextPath)}`}
          className="text-brand font-semibold"
        >
          Sign in
        </Link>
      </p>
    </form>
  )
}
