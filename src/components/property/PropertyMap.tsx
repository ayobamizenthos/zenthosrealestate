import { MapPin } from 'lucide-react'

export function PropertyMap({ address, location }: { address: string; location: string }) {
  const place = [address, location, 'Lagos', 'Nigeria'].filter(Boolean).join(', ')
  const embedSrc = `https://www.google.com/maps?q=${encodeURIComponent(place)}&z=15&output=embed`
  const readable = [address, location, 'Lagos'].filter(Boolean).join(', ')

  return (
    <section className="rounded-card shadow-card overflow-hidden bg-white">
      <div className="flex items-center gap-2 px-4 py-4 md:px-5">
        <MapPin size={18} className="text-brand shrink-0" aria-hidden="true" fill="currentColor" />
        <h2 className="text-ink text-[16px] font-bold md:text-[17px]">Map and location</h2>
      </div>

      <p className="text-muted flex items-start gap-1.5 px-4 pb-3 text-[14px] md:px-5">
        <MapPin
          size={15}
          aria-hidden="true"
          className="text-brand mt-0.5 shrink-0"
          fill="currentColor"
        />
        {readable}
      </p>

      <iframe
        src={embedSrc}
        title={`Map showing ${readable}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="block aspect-[4/3] w-full border-0 sm:aspect-[16/9] md:aspect-[21/9]"
      />
    </section>
  )
}
