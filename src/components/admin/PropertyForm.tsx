'use client'

import { Check, LoaderCircle } from 'lucide-react'
import Link from 'next/link'
import { useActionState } from 'react'
import { Button } from '@/components/ui/Button'
import { SelectField, TextArea, TextField } from '@/components/ui/TextField'
import type { PropertyActionState } from '@/lib/actions/properties'
import {
  AMENITIES,
  FURNISHED_STATES,
  LISTING_TYPES,
  LOCATIONS_BY_STATE,
  STATES,
  TITLE_DOCUMENTS,
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
} from '@/lib/constants'
import type { Property } from '@/lib/types'
import { ImageUploader } from './ImageUploader'

interface PropertyFormProps {
  action: (state: PropertyActionState, formData: FormData) => Promise<PropertyActionState>
  property?: Property
}

const INITIAL_STATE: PropertyActionState = {}

function FormToggle({
  name,
  defaultChecked,
  title,
  description,
}: {
  name: string
  defaultChecked?: boolean
  title: string
  description: string
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 p-4">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="bg-hairline peer-checked:bg-brand relative h-7 w-12 shrink-0 rounded-full transition-colors">
        <span className="absolute top-1 left-1 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
      </span>
      <span>
        <span className="text-ink block text-[15px] font-semibold">{title}</span>
        <span className="text-muted block text-[13px]">{description}</span>
      </span>
    </label>
  )
}

export function PropertyForm({ action, property }: PropertyFormProps) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE)
  const isEditing = Boolean(property)

  return (
    <form action={formAction} className="space-y-8">
      {property ? <input type="hidden" name="id" value={property.id} /> : null}

      <section className="space-y-4">
        <TextField
          label="Title"
          name="title"
          required
          defaultValue={property?.title}
          placeholder="4 Bedroom Detached Duplex"
          error={state.fieldErrors?.title}
        />

        <TextArea
          label="Description"
          name="description"
          rows={7}
          defaultValue={property?.description}
          placeholder="Describe the layout, finishes, compound and documentation."
          hint="This text is what Google indexes. Write it for a buyer, not a crawler."
          error={state.fieldErrors?.description}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <SelectField
            label="Area"
            name="location"
            required
            defaultValue={property?.location ?? LOCATIONS_BY_STATE.Lagos[0]}
            error={state.fieldErrors?.location}
          >
            {STATES.map(stateName => (
              <optgroup key={stateName} label={stateName}>
                {LOCATIONS_BY_STATE[stateName].map(location => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </optgroup>
            ))}
          </SelectField>

          <SelectField
            label="State"
            name="state"
            required
            defaultValue={property?.state ?? 'Lagos'}
            error={state.fieldErrors?.state}
          >
            {STATES.map(stateName => (
              <option key={stateName} value={stateName}>
                {stateName}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Title document"
            name="title_document"
            defaultValue={property?.title_document ?? ''}
            error={state.fieldErrors?.title_document}
          >
            <option value="">Not stated</option>
            {TITLE_DOCUMENTS.map(document => (
              <option key={document} value={document}>
                {document}
              </option>
            ))}
          </SelectField>

          <TextField
            label="Address or landmark"
            name="address"
            defaultValue={property?.address}
            placeholder="Off Admiralty Way, Lekki Phase 1"
            error={state.fieldErrors?.address}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Price (₦)"
            name="price"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={property?.price ?? ''}
            hint="Leave empty to market as Price on Request."
            error={state.fieldErrors?.price}
          />

          <TextField
            label="Price label"
            name="price_label"
            defaultValue={property?.price_label ?? ''}
            placeholder="Price on Request"
            hint="Overrides the figure above when set."
            error={state.fieldErrors?.price_label}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <SelectField
            label="Property type"
            name="property_type"
            required
            defaultValue={property?.property_type ?? PROPERTY_TYPES[0]}
          >
            {PROPERTY_TYPES.map(propertyType => (
              <option key={propertyType} value={propertyType}>
                {propertyType}
              </option>
            ))}
          </SelectField>

          <TextField
            label="Bedrooms"
            name="bedrooms"
            type="number"
            inputMode="numeric"
            min={0}
            required
            defaultValue={property?.bedrooms ?? 0}
            error={state.fieldErrors?.bedrooms}
          />

          <TextField
            label="Bathrooms"
            name="bathrooms"
            type="number"
            inputMode="numeric"
            min={0}
            required
            defaultValue={property?.bathrooms ?? 0}
            error={state.fieldErrors?.bathrooms}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Toilets"
            name="toilets"
            type="number"
            inputMode="numeric"
            min={0}
            required
            defaultValue={property?.toilets ?? 0}
            error={state.fieldErrors?.toilets}
          />

          <TextField
            label="Floor area (m²)"
            name="area_sqm"
            type="number"
            inputMode="numeric"
            min={1}
            defaultValue={property?.area_sqm ?? ''}
            hint="Leave empty if not measured."
            error={state.fieldErrors?.area_sqm}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <SelectField
            label="Furnishing"
            name="furnished"
            defaultValue={property?.furnished ?? 'Unfurnished'}
          >
            {FURNISHED_STATES.map(state => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Listing type"
            name="listing_type"
            required
            defaultValue={property?.listing_type ?? LISTING_TYPES[0]}
          >
            {LISTING_TYPES.map(listingType => (
              <option key={listingType} value={listingType}>
                For {listingType.toLowerCase()}
              </option>
            ))}
          </SelectField>

          <SelectField label="Status" name="status" defaultValue={property?.status ?? 'Available'}>
            {PROPERTY_STATUSES.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </SelectField>
        </div>
      </section>

      <section>
        <p className="text-ink text-[14px] font-semibold">Amenities</p>
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 md:grid-cols-3">
          {AMENITIES.map(amenity => (
            <label
              key={amenity}
              className="flex min-h-11 cursor-pointer items-center gap-2.5 text-[14px]"
            >
              <input
                type="checkbox"
                name="amenities"
                value={amenity}
                defaultChecked={property?.amenities.includes(amenity)}
                className="peer sr-only"
              />
              <span className="border-hairline peer-checked:bg-brand peer-checked:border-brand flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border bg-white text-white transition-colors">
                <Check size={13} strokeWidth={3} aria-hidden="true" />
              </span>
              <span className="text-ink">{amenity}</span>
            </label>
          ))}
        </div>
      </section>

      <section>
        <ImageUploader initialImages={property?.images ?? []} />
      </section>

      <section className="border-hairline divide-hairline divide-y rounded-card border bg-white">
        <FormToggle
          name="featured"
          defaultChecked={property?.featured}
          title="Feature on homepage"
          description="Featured listings lead the homepage showcase and rank first in browse."
        />
        <FormToggle
          name="verified"
          defaultChecked={property?.verified}
          title="Verified by Zenthos"
          description="Only tick this once a broker has physically inspected the property."
        />
        <FormToggle
          name="serviced"
          defaultChecked={property?.serviced}
          title="Serviced"
          description="Service charge covers power, water, security and common-area upkeep."
        />
      </section>

      {state.error ? (
        <p role="alert" className="text-danger text-[14px]">
          {state.error}
        </p>
      ) : null}

      <div className="border-hairline sticky bottom-0 flex flex-wrap gap-2 border-t bg-white py-4">
        <Button type="submit" name="intent" value="publish" disabled={isPending}>
          {isPending ? (
            <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />
          ) : null}
          {isEditing ? 'Save and publish' : 'Publish'}
        </Button>

        <Button type="submit" name="intent" value="draft" variant="secondary" disabled={isPending}>
          Save as draft
        </Button>

        <Link
          href="/admin/properties"
          className="text-muted hover:text-ink flex h-12 items-center px-3 text-[15px] font-semibold transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
