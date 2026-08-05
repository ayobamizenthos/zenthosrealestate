import { Check } from 'lucide-react'
import type { Amenity } from '@/lib/constants'

export function AmenityList({ amenities }: { amenities: Amenity[] }) {
  if (!amenities.length) return null

  return (
    <ul className="grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {amenities.map(amenity => (
        <li key={amenity} className="text-ink flex items-center gap-2.5 text-[14px] md:text-[15px]">
          <Check size={16} strokeWidth={3} aria-hidden="true" className="text-brand shrink-0" />
          {amenity}
        </li>
      ))}
    </ul>
  )
}
