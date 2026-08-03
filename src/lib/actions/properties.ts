'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'
import {
  AMENITIES,
  FURNISHED_STATES,
  LISTING_TYPES,
  MAX_IMAGES_PER_PROPERTY,
  PROPERTY_LOCATIONS,
  STATES,
  TITLE_DOCUMENTS,
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
} from '@/lib/constants'
import { notifyNewProperty, notifyPriceDrop, notifyStatusChange } from '@/lib/push/notify'
import { getPropertyByIdForAdmin } from '@/lib/queries/properties'

export interface PropertyActionState {
  error?: string
  fieldErrors?: Record<string, string>
}

const propertySchema = z.object({
  title: z.string().trim().min(3, 'Title is required').max(160),
  description: z.string().trim().max(8000).default(''),
  location: z.enum(PROPERTY_LOCATIONS),
  state: z.enum(STATES),
  title_document: z
    .string()
    .trim()
    .transform(value => (value === '' ? null : value))
    .pipe(z.enum(TITLE_DOCUMENTS).nullable()),
  address: z.string().trim().max(240).default(''),
  price: z
    .string()
    .trim()
    .transform(value => (value === '' ? null : Number.parseInt(value, 10)))
    .refine(value => value === null || (Number.isFinite(value) && value >= 0), {
      message: 'Price must be a whole number of Naira',
    }),
  price_label: z.string().trim().max(60).default(''),
  property_type: z.enum(PROPERTY_TYPES),
  bedrooms: z.coerce.number().int().min(0).max(50),
  bathrooms: z.coerce.number().int().min(0).max(50),
  toilets: z.coerce.number().int().min(0).max(50),
  area_sqm: z
    .string()
    .trim()
    .transform(value => (value === '' ? null : Number.parseInt(value, 10)))
    .refine(value => value === null || (Number.isFinite(value) && value > 0), {
      message: 'Floor area must be a positive number of square metres',
    }),
  serviced: z.boolean(),
  furnished: z.enum(FURNISHED_STATES),
  listing_type: z.enum(LISTING_TYPES),
  status: z.enum(PROPERTY_STATUSES),
  amenities: z.array(z.enum(AMENITIES)).max(AMENITIES.length),
  images: z.array(z.string().url()).max(MAX_IMAGES_PER_PROPERTY),
  featured: z.boolean(),
  published: z.boolean(),
})

function readForm(formData: FormData) {
  const rawImages = formData.get('images')

  let images: unknown = []
  try {
    images = JSON.parse(typeof rawImages === 'string' && rawImages ? rawImages : '[]')
  } catch {
    images = []
  }

  return propertySchema.safeParse({
    title: formData.get('title') ?? '',
    description: formData.get('description') ?? '',
    location: formData.get('location'),
    state: formData.get('state') ?? 'Lagos',
    title_document: formData.get('title_document') ?? '',
    address: formData.get('address') ?? '',
    price: formData.get('price') ?? '',
    price_label: formData.get('price_label') ?? '',
    property_type: formData.get('property_type'),
    bedrooms: formData.get('bedrooms') ?? 0,
    bathrooms: formData.get('bathrooms') ?? 0,
    toilets: formData.get('toilets') ?? 0,
    area_sqm: formData.get('area_sqm') ?? '',
    serviced: formData.get('serviced') === 'on',
    furnished: formData.get('furnished'),
    listing_type: formData.get('listing_type'),
    status: formData.get('status') ?? 'Available',
    amenities: formData.getAll('amenities'),
    images,
    featured: formData.get('featured') === 'on',
    published: formData.get('intent') === 'publish',
  })
}

function toFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.')
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message
  }
  return fieldErrors
}

export async function createPropertyAction(
  _previousState: PropertyActionState,
  formData: FormData
): Promise<PropertyActionState> {
  const { supabase } = await requireAdmin()
  const parsed = readForm(formData)

  if (!parsed.success) {
    return { error: 'Check the highlighted fields.', fieldErrors: toFieldErrors(parsed.error) }
  }

  const { data, error } = await supabase
    .from('properties')
    .insert(parsed.data)
    .select('id')
    .single()

  if (error) return { error: `Could not save property: ${error.message}` }

  if (parsed.data.published) {
    const created = await getPropertyByIdForAdmin(supabase, data.id)
    // A failed fan-out must not roll back a successful publish.
    if (created) await notifyNewProperty(created).catch(() => undefined)
  }

  revalidatePath('/admin/properties')
  revalidatePath('/properties')
  revalidatePath('/')
  redirect('/admin/properties')
}

export async function updatePropertyAction(
  _previousState: PropertyActionState,
  formData: FormData
): Promise<PropertyActionState> {
  const { supabase } = await requireAdmin()
  const propertyId = formData.get('id')

  if (typeof propertyId !== 'string' || !propertyId) {
    return { error: 'Missing property reference.' }
  }

  const parsed = readForm(formData)
  if (!parsed.success) {
    return { error: 'Check the highlighted fields.', fieldErrors: toFieldErrors(parsed.error) }
  }

  const before = await getPropertyByIdForAdmin(supabase, propertyId)
  if (!before) return { error: 'That property no longer exists.' }

  const { error } = await supabase.from('properties').update(parsed.data).eq('id', propertyId)
  if (error) return { error: `Could not update property: ${error.message}` }

  const after = await getPropertyByIdForAdmin(supabase, propertyId)

  if (after) {
    const droppedPrice = before.price !== null && after.price !== null && after.price < before.price

    if (droppedPrice) await notifyPriceDrop(after, before.price as number).catch(() => undefined)
    if (before.status !== after.status) await notifyStatusChange(after).catch(() => undefined)
    // Publishing a previously hidden draft is the moment it becomes "new".
    if (!before.published && after.published) {
      await notifyNewProperty(after).catch(() => undefined)
    }
  }

  revalidatePath('/admin/properties')
  revalidatePath('/properties')
  revalidatePath(`/properties/${before.slug}`)
  revalidatePath('/')
  redirect('/admin/properties')
}

export async function deletePropertyAction(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin()
  const propertyId = formData.get('id')

  if (typeof propertyId !== 'string' || !propertyId) return

  await supabase.from('properties').delete().eq('id', propertyId)

  revalidatePath('/admin/properties')
  revalidatePath('/properties')
  revalidatePath('/')
}
