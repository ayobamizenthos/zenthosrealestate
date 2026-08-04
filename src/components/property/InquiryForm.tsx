'use client'

import { LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import { TextArea, TextField } from '@/components/ui/TextField'
import { submitInquiryAction } from '@/lib/actions/inquiries'
import type { Property } from '@/lib/types'
import { inquiryHandoffLink } from '@/lib/whatsapp'

type InquiryProperty = Pick<Property, 'id' | 'title' | 'location' | 'state' | 'reference_code'>

export function InquiryForm({ property }: { property: InquiryProperty }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    const draft = { name, email, phone, message }

    const handoff = window.open(inquiryHandoffLink(property, draft), '_blank', 'noopener')

    const formData = new FormData()
    formData.set('propertyId', property.id)
    formData.set('name', name)
    formData.set('email', email)
    formData.set('phone', phone)
    formData.set('message', message)

    await submitInquiryAction({}, formData).catch(() => undefined)

    if (!handoff) window.location.href = inquiryHandoffLink(property, draft)
    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-card shadow-card bg-white p-5 md:p-6">
      <h2 className="text-ink text-[17px] font-bold">Enquire about this property</h2>
      <p className="text-muted mt-1 text-[14px] leading-relaxed">
        Fill this in and we will open WhatsApp with your details already written out. A broker
        replies in minutes during working hours.
      </p>

      <div className="mt-4 space-y-3">
        <TextField
          label="Name"
          name="name"
          autoComplete="name"
          required
          value={name}
          onChange={event => setName(event.target.value)}
        />
        <TextField
          label="Phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          value={phone}
          onChange={event => setPhone(event.target.value)}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          hint="Optional"
          value={email}
          onChange={event => setEmail(event.target.value)}
        />
        <TextArea
          label="Message"
          name="message"
          rows={3}
          placeholder={`When can I inspect ${property.title}?`}
          value={message}
          onChange={event => setMessage(event.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-whatsapp hover:bg-whatsapp-hover rounded-control mt-4 flex h-12 w-full items-center justify-center gap-2 text-[15px] font-bold text-white transition-colors disabled:opacity-60"
      >
        {isSubmitting ? (
          <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
        ) : (
          <WhatsAppIcon className="h-5 w-5" />
        )}
        {isSubmitting ? 'Opening WhatsApp' : 'Send on WhatsApp'}
      </button>
    </form>
  )
}
