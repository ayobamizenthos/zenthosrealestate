import type { ZenthosSupabaseClient } from '@/lib/supabase/types'

export interface AreaGuide {
  location: string
  headline: string
  overview: string
  estates: string
  shopping: string
  landmarks: string
  gettingAround: string
}

const COLUMNS = 'location, headline, overview, estates, shopping, landmarks, getting_around'

function toGuide(row: {
  location: string
  headline: string
  overview: string
  estates: string
  shopping: string
  landmarks: string
  getting_around: string
}): AreaGuide {
  return {
    location: row.location,
    headline: row.headline,
    overview: row.overview,
    estates: row.estates,
    shopping: row.shopping,
    landmarks: row.landmarks,
    gettingAround: row.getting_around,
  }
}

export async function getAreaGuide(
  supabase: ZenthosSupabaseClient,
  location: string
): Promise<AreaGuide | null> {
  const { data, error } = await supabase
    .from('area_guides')
    .select(COLUMNS)
    .eq('location', location)
    .maybeSingle()

  if (error || !data) return null
  return toGuide(data)
}

export async function listAreaGuides(supabase: ZenthosSupabaseClient): Promise<AreaGuide[]> {
  const { data, error } = await supabase.from('area_guides').select(COLUMNS).order('location')

  if (error || !data) return []
  return data.map(toGuide)
}
