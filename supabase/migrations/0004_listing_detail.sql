-- Fields every serious Nigerian property portal shows on a listing card, and
-- which buyers filter on: toilets, floor area, serviced status, and a short
-- human-quotable reference for phone and WhatsApp enquiries.

alter table public.properties
  add column if not exists toilets integer not null default 0 check (toilets >= 0),
  add column if not exists area_sqm integer check (area_sqm is null or area_sqm > 0),
  add column if not exists serviced boolean not null default false,
  add column if not exists verified boolean not null default false,
  add column if not exists reference_code text;

-- Short, unambiguous code: ZEN-<6 base36 chars>. Generated once and never
-- rewritten, so a code quoted on a call always resolves to the same listing.
create or replace function public.set_property_reference()
returns trigger
language plpgsql
as $$
declare
  candidate text;
begin
  if new.reference_code is not null then
    return new;
  end if;

  loop
    candidate := 'ZEN-' || upper(substr(md5(gen_random_uuid()::text), 1, 6));
    exit when not exists (select 1 from public.properties where reference_code = candidate);
  end loop;

  new.reference_code := candidate;
  return new;
end;
$$;

drop trigger if exists properties_set_reference on public.properties;
create trigger properties_set_reference
  before insert on public.properties
  for each row execute function public.set_property_reference();

-- Backfill anything created before this migration.
update public.properties
set reference_code = 'ZEN-' || upper(substr(md5(id::text), 1, 6))
where reference_code is null;

alter table public.properties
  drop constraint if exists properties_reference_code_key;
alter table public.properties
  add constraint properties_reference_code_key unique (reference_code);

create index if not exists properties_serviced_idx on public.properties (serviced) where serviced;
create index if not exists properties_bedrooms_idx on public.properties (bedrooms);

-- The search vector should match on reference code too, so pasting "ZEN-4A2B91"
-- into the search box finds the listing.
alter table public.properties drop column if exists search_vector;
alter table public.properties add column search_vector tsvector
  generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(reference_code, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(location, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(address, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'D')
  ) stored;

create index if not exists properties_search_idx on public.properties using gin (search_vector);

-- Give the seeded listings realistic values for the new fields.
update public.properties set
  toilets = greatest(bathrooms, 1),
  serviced = (furnished = 'Furnished'),
  verified = true,
  area_sqm = case
    when bedrooms >= 6 then 780
    when bedrooms = 5 then 520
    when bedrooms = 4 then 340
    when bedrooms = 3 then 210
    else 120
  end
where area_sqm is null;
