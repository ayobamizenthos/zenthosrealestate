import type { Metadata } from 'next'
import { Suspense } from 'react'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { Skeleton } from '@/components/ui/Skeleton'

export const metadata: Metadata = {
  title: 'Create account',
  description: 'Create a Zenthos Real Estate account to save and compare Lagos properties.',
  robots: { index: false, follow: true },
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[520px] w-full" />}>
      <RegisterForm />
    </Suspense>
  )
}
