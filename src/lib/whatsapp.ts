import { SITE } from './constants'

export function toWhatsAppNumber(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '')

  if (digits.startsWith('234')) return digits
  if (digits.startsWith('0')) return `234${digits.slice(1)}`
  if (digits.length === 10) return `234${digits}`
  return digits
}

export function whatsappLink(message: string, phone: string = SITE.whatsappNumber): string {
  return `https://wa.me/${toWhatsAppNumber(phone)}?text=${encodeURIComponent(message)}`
}

export function propertyInquiryLink(property: { title: string; location: string }): string {
  return whatsappLink(
    `Hi, I'm interested in ${property.title} at ${property.location}. Please share more details.`
  )
}

export function generalInquiryLink(): string {
  return whatsappLink(`Hi, I'd like to inquire about properties on ${SITE.name}.`)
}

export interface InquiryDraft {
  name: string
  email: string
  phone: string
  message: string
}

export function inquiryHandoffLink(
  property: { title: string; location: string; state: string; reference_code: string },
  draft: InquiryDraft
): string {
  const lines = [
    `*Property enquiry*`,
    ``,
    `*Listing:* ${property.title}`,
    `*Area:* ${property.location}, ${property.state}`,
    `*Reference:* ${property.reference_code}`,
    ``,
    `*Name:* ${draft.name}`,
    `*Phone:* ${draft.phone}`,
  ]

  if (draft.email.trim()) lines.push(`*Email:* ${draft.email.trim()}`)

  if (draft.message.trim()) {
    lines.push(``, `*Message:*`, draft.message.trim())
  }

  return whatsappLink(lines.join('\n'))
}

export function inquiryReplyLink(inquiry: {
  name: string
  phone: string
  propertyTitle: string | null
}): string {
  const subject = inquiry.propertyTitle ?? 'your enquiry'
  return whatsappLink(
    `Hi ${inquiry.name}, thanks for your inquiry about ${subject}.`,
    inquiry.phone
  )
}
