import { Eye, MessageCircleMore, ShieldCheck, Wallet } from 'lucide-react'

const PROMISES = [
  {
    Icon: Eye,
    title: 'Physically inspected',
    body: 'A broker walks every property before it is listed. What you see is what stands there.',
  },
  {
    Icon: ShieldCheck,
    title: 'Documents checked',
    body: 'Survey, consent and title are reviewed up front, so nothing surfaces at the last minute.',
  },
  {
    Icon: MessageCircleMore,
    title: 'Straight to WhatsApp',
    body: 'No enquiry queue and no call centre. Your message reaches a broker who knows the property.',
  },
  {
    Icon: Wallet,
    title: 'No fee to browse',
    body: 'Buyers pay us nothing. We are paid by the owner on completion.',
  },
]

export function TrustBand() {
  return (
    <section className="bg-surface">
      <div className="app-shell py-16 md:py-24">
        <div className="grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
          {PROMISES.map(({ Icon, title, body }) => (
            <div key={title}>
              <Icon size={22} className="text-brand" aria-hidden="true" />
              <h3 className="text-ink mt-4 text-[16px] font-bold">{title}</h3>
              <p className="text-muted mt-2 text-[14px] leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
