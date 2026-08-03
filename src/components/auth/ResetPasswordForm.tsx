'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

const MIN_PASSWORD_LENGTH = 8

/**
 * Reached from the emailed recovery link. Supabase has already exchanged the
 * link for a session by the time this renders, so updateUser is enough.
 */
export function ResetPasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (password.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setErrorMessage(
        'That reset link has expired or was already used. Request a new one from the sign-in page.'
      )
      setIsSubmitting(false)
      return
    }

    router.replace('/')
    router.refresh()
  }

  return (
    <form onSubmit={submit} noValidate>
      <h1 className="text-brand text-title font-extrabold">Set a new password</h1>

      <div className="mt-6">
        <TextField
          label="New password"
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
        {isSubmitting ? 'Saving…' : 'Save password'}
      </Button>
    </form>
  )
}
