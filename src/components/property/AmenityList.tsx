import {
  ArrowUpDown,
  BookOpen,
  Building2,
  Car,
  ChefHat,
  Droplets,
  Dumbbell,
  Film,
  House,
  ShieldCheck,
  Trees,
  Video,
  Wind,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type { Amenity } from '@/lib/constants'

const AMENITY_ICONS: Record<Amenity, LucideIcon> = {
  'Swimming Pool': Droplets,
  Gym: Dumbbell,
  '24hr Power': Zap,
  Security: ShieldCheck,
  Parking: Car,
  Garden: Trees,
  Elevator: ArrowUpDown,
  "Boys' Quarters": House,
  CCTV: Video,
  Borehole: Droplets,
  'Air Conditioning': Wind,
  'Fitted Kitchen': ChefHat,
  Balcony: Building2,
  'Study Room': BookOpen,
  'Cinema Room': Film,
}

export function AmenityList({ amenities }: { amenities: Amenity[] }) {
  if (!amenities.length) return null

  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-3">
      {amenities.map(amenity => {
        const Icon = AMENITY_ICONS[amenity]
        return (
          <li key={amenity} className="text-ink flex items-center gap-2.5 text-[14px]">
            <span className="bg-surface text-brand flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
              {Icon ? <Icon size={17} aria-hidden="true" /> : null}
            </span>
            {amenity}
          </li>
        )
      })}
    </ul>
  )
}
