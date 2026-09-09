-- Live counts for the homepage "browse by type" cards and the stats band.
-- Aggregating in the database keeps the homepage to a fixed number of rows
-- regardless of how large the catalogue grows.

create or replace view public.property_type_showcase
with (security_invoker = on) as
select
  p.property_type,
  count(*)::int as property_count,
  array_agg(p.images[1] order by p.featured desc, p.created_at desc)
    filter (where cardinality(p.images) > 0) as cover_images
from public.properties p
where p.published and p.status <> 'Sold'
group by p.property_type;

create or replace view public.catalogue_stats
with (security_invoker = on) as
select
  count(*)::int as total_listings,
  count(*) filter (where listing_type = 'Sale')::int as for_sale,
  count(*) filter (where listing_type = 'Rent')::int as for_rent,
  count(*) filter (where listing_type = 'Shortlet')::int as shortlets,
  count(*) filter (where verified)::int as verified_listings,
  count(distinct location)::int as areas_covered
from public.properties
where published and status <> 'Sold';

grant select on public.property_type_showcase to anon, authenticated;
grant select on public.catalogue_stats to anon, authenticated;
