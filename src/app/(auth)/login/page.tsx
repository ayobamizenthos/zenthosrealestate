import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import { Skeleton } from '@/components/ui/Skeleton'

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to save properties and track price changes on Zenthos Real Estate.',
  robots: { index: false, follow: true },
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <LoginForm />
    </Suspense>
  )
}
