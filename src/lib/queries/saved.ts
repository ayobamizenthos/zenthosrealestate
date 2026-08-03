import type { ZenthosSupabaseClient } from '@/lib/supabase/types'

export async function getSavedPropertyIds(
  supabase: ZenthosSupabaseClient,
  userId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from('saved_properties')
    .select('property_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to load saved properties: ${error.message}`)
  return (data ?? []).map(row => row.property_id)
}

export async function saveProperty(
  supabase: ZenthosSupabaseClient,
  userId: string,
  propertyId: string
): Promise<void> {
  const { error } = await supabase
    .from('saved_properties')
    .upsert({ user_id: userId, property_id: propertyId }, { onConflict: 'user_id,property_id' })

  if (error) throw new Error(`Failed to save property: ${error.message}`)
}

export async function unsaveProperty(
  supabase: ZenthosSupabaseClient,
  userId: string,
  propertyId: string
): Promise<void> {
  const { error } = await supabase
    .from('saved_properties')
    .delete()
    .eq('user_id', userId)
    .eq('property_id', propertyId)

  if (error) throw new Error(`Failed to remove saved property: ${error.message}`)
}

/** Users who saved a given listing — the audience for price and status alerts. */
export async function getUsersWhoSaved(
  supabase: ZenthosSupabaseClient,
  propertyId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from('saved_properties')
    .select('user_id')
    .eq('property_id', propertyId)

  if (error) throw new Error(`Failed to load save audience: ${error.message}`)
  return (data ?? []).map(row => row.user_id)
}
