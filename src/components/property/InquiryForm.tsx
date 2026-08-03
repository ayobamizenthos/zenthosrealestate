'use client'

import { CircleCheck, LoaderCircle } from 'lucide-react'
import { useActionState } from 'react'
import { Button } from '@/components/ui/Button'
import { TextArea, TextField } from '@/components/ui/TextField'
import { submitInquiryAction, type InquiryActionState } from '@/lib/actions/inquiries'

const INITIAL_STATE: InquiryActionState = {}

/**
 * Secondary to WhatsApp, which is how most enquiries actually arrive. Kept for
 * people who would rather not hand over a phone number up front.
 */
export function InquiryForm({
  propertyId,
  propertyTitle,
}: {
  propertyId: string
  propertyTitle: string
}) {
  const [state, formAction, isPending] = useActionState(submitInquiryAction, INITIAL_STATE)

  if (state.sent) {
    return (
      <div className="border-hairline rounded-card flex items-start gap-3 border bg-white p-5">
        <CircleCheck size={20} className="text-success mt-0.5 shrink-0" aria-hidden="true" />
        <div>
          <p className="text-ink text-[15px] font-bold">Enquiry sent</p>
          <p className="text-muted mt-1 text-[14px] leading-relaxed">
            A broker will be in touch about {propertyTitle}. For a faster reply, message us on
            WhatsApp.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form action={formAction} className="border-hairline rounded-card border bg-white p-5">
      <h2 className="text-ink text-[17px] font-bold">Request details</h2>
      <p className="text-muted mt-1 text-[14px]">
        Prefer email? Send your details and we&rsquo;ll reply with the full brief.
      </p>

      <input type="hidden" name="propertyId" value={propertyId} />

      <div className="mt-4 space-y-3">
        <TextField label="Name" name="name" autoComplete="name" required />
        <TextField label="Email" name="email" type="email" autoComplete="email" required />
        <TextField label="Phone" name="phone" type="tel" autoComplete="tel" required />
        <TextArea
          label="Message"
          name="message"
          rows={3}
          defaultValue={`I'd like more details about ${propertyTitle}.`}
        />
      </div>

      {state.error ? (
        <p role="alert" className="text-danger mt-3 text-[14px]">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" fullWidth className="mt-4" disabled={isPending}>
        {isPending ? <LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> : null}
        {isPending ? 'Sending…' : 'Send enquiry'}
      </Button>
    </form>
  )
}
