'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'

export interface FeaturedActionState {
  error?: string
  // Bumped on every success so the client can tell one save from the next and
  // pull fresh server data; these pages are dynamic, so revalidatePath alone
  // leaves the rendered list stale.
  savedAt?: number
}

async function reorder(orderedIds: string[]): Promise<FeaturedActionState> {
  const { supabase } = await requireAdmin()

  for (const [index, id] of orderedIds.entries()) {
    const { error } = await supabase
      .from('properties')
      .update({ featured_rank: index + 1 })
      .eq('id', id)

    if (error) return { error: `Could not save the new order: ${error.message}` }
  }

  revalidatePath('/')
  revalidatePath('/admin/featured')
  return { savedAt: Date.now() }
}

export async function moveFeaturedProperty(
  _state: FeaturedActionState,
  formData: FormData
): Promise<FeaturedActionState> {
  const id = String(formData.get('id') ?? '')
  const target = Number.parseInt(String(formData.get('position') ?? ''), 10)
  const currentOrder = String(formData.get('order') ?? '')
    .split(',')
    .filter(Boolean)

  if (!id || !currentOrder.includes(id)) return { error: 'That listing is no longer featured.' }
  if (!Number.isFinite(target) || target < 1 || target > currentOrder.length) {
    return { error: `Pick a position between 1 and ${currentOrder.length}.` }
  }

  const without = currentOrder.filter(entry => entry !== id)
  without.splice(target - 1, 0, id)

  return reorder(without)
}

export async function setFeatured(
  _state: FeaturedActionState,
  formData: FormData
): Promise<FeaturedActionState> {
  const { supabase } = await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const featured = formData.get('featured') === 'true'

  if (!id) return { error: 'Missing listing.' }

  const { error } = await supabase
    .from('properties')
    .update({ featured, featured_rank: featured ? 9999 : null })
    .eq('id', id)

  if (error) return { error: `Could not update that listing: ${error.message}` }

  revalidatePath('/')
  revalidatePath('/admin/featured')
  return { savedAt: Date.now() }
}
