alter table public.properties
  add column if not exists area_sqm integer check (area_sqm is null or area_sqm > 0);
