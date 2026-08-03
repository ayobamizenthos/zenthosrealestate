import { SITE } from './constants'

/**
 * wa.me requires a bare international number. Nigerian numbers are quoted three
 * ways in practice — 0811…, 234811…, +234 811 … — so normalise all of them.
 */
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

/**
 * Formats a completed enquiry form as a WhatsApp message. Every field the buyer
 * filled in is laid out under a heading so a broker reading it on a phone can
 * act without opening a dashboard, and the reference is included so the listing
 * can be pulled up by code.
 */
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

/** Used from the admin inquiries table to reply to the sender directly. */
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
