const STEPS = [
  {
    title: 'Tell us what you are looking for',
    body: 'Area, budget, bedrooms. Message us on WhatsApp and a broker replies with what is actually available, including homes we have not advertised yet.',
  },
  {
    title: 'Inspect before you commit',
    body: 'We arrange the viewing and go with you. Inspections are free and you are never asked for money to see a property.',
  },
  {
    title: 'We check the documents',
    body: 'Governor’s Consent, Certificate of Occupancy, Deed of Assignment, survey. Our lawyer confirms the title is clean and the seller can transfer it before any money moves.',
  },
  {
    title: 'Payment and handover',
    body: 'Funds go to the seller through a documented process. You receive the signed deed, the survey and the keys.',
  },
]

export function BuyingSteps() {
  return (
    <div className="grid gap-x-10 gap-y-10 md:grid-cols-2">
      {STEPS.map((step, index) => (
        <div key={step.title} className="flex gap-5">
          <span
            aria-hidden="true"
            className="text-brand/25 shrink-0 text-[42px] leading-none font-extrabold tabular-nums"
          >
            {index + 1}
          </span>
          <div className="min-w-0">
            <h3 className="text-ink text-[17px] leading-snug font-bold">{step.title}</h3>
            <p className="text-muted mt-2 text-[14px] leading-relaxed md:text-[15px]">
              {step.body}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
