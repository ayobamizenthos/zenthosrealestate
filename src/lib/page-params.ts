/** Reads a 1-based `?page=` value, rejecting anything that is not a real page. */
export function readPageParam(params: Record<string, string | string[] | undefined>): number {
  const raw = params.page
  const value = Array.isArray(raw) ? raw[0] : raw
  if (!value) return 1

  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}
