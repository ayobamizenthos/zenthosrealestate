-- Widens the model to the market Zenthos actually brokers: Lagos island and
-- mainland plus Abuja, Nigerian property-type vocabulary, and the title
-- document — which is the first question every serious Nigerian buyer asks.

alter table public.properties
  add column if not exists state text not null default 'Lagos',
  add column if not exists title_document text;

-- Locations are areas, not cities. Constrained rather than free text so filters,
-- landing pages and the sitemap all stay in lockstep.
alter table public.properties drop constraint if exists properties_location_check;
alter table public.properties add constraint properties_location_check check (
  location in (
    -- Lagos island
    'Victoria Island', 'Ikoyi', 'Lekki', 'Ajah', 'Banana Island', 'Oniru', 'Eko Atlantic',
    -- Lagos mainland
    'Ikeja', 'Yaba', 'Surulere', 'Magodo', 'Gbagada', 'Maryland', 'Ogudu', 'Omole',
    -- Abuja
    'Maitama', 'Asokoro', 'Wuse', 'Gwarinpa', 'Jabi', 'Katampe', 'Guzape', 'Lokogoma'
  )
);

alter table public.properties drop constraint if exists properties_state_check;
alter table public.properties add constraint properties_state_check check (
  state in ('Lagos', 'Abuja')
);

alter table public.properties drop constraint if exists properties_title_document_check;
alter table public.properties add constraint properties_title_document_check check (
  title_document is null or title_document in (
    'Governor''s Consent',
    'Certificate of Occupancy',
    'Deed of Assignment',
    'Registered Survey',
    'Excision',
    'Gazette',
    'Family Receipt'
  )
);

-- Nigerian buyers search "detached duplex", not "detached". The vocabulary has
-- to match how listings are actually described.
alter table public.properties drop constraint if exists properties_property_type_check;
alter table public.properties add constraint properties_property_type_check check (
  property_type in (
    'Apartment',
    'Studio Apartment',
    'Penthouse',
    'Maisonette',
    'Detached Duplex',
    'Semi-detached Duplex',
    'Terraced Duplex',
    'Detached Bungalow',
    'Semi-detached Bungalow',
    'Terraced Bungalow'
  )
);

create index if not exists properties_state_idx on public.properties (state);
create index if not exists properties_title_document_idx on public.properties (title_document);

-- Search must also match the title document and the street, so "governor's
-- consent lekki" resolves.
alter table public.properties drop column if exists search_vector;
alter table public.properties add column search_vector tsvector
  generated always as (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(property_type, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(reference_code, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(location, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(address, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(state, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(title_document, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(bedrooms::text, '') || ' bedroom ' || coalesce(bedrooms::text, '') || 'bed'), 'B') ||
    setweight(to_tsvector('simple', coalesce(description, '')), 'D')
  ) stored;

create index if not exists properties_search_idx on public.properties using gin (search_vector);

-- Trigram indexes back the fuzzy fallback for misspellings and joined words.
create index if not exists properties_title_trgm_idx on public.properties using gin (title gin_trgm_ops);
create index if not exists properties_location_trgm_idx on public.properties using gin (location gin_trgm_ops);
create index if not exists properties_type_trgm_idx on public.properties using gin (property_type gin_trgm_ops);
