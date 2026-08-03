-- Backs the homepage location tiles: one cover image and a live count per area,
-- without pulling every listing into the page to aggregate in JavaScript.

create or replace view public.location_showcase
with (security_invoker = on) as
select
  p.location,
  count(*)::int as property_count,
  array_agg(p.images[1] order by p.featured desc, p.created_at desc)
    filter (where cardinality(p.images) > 0) as cover_images
from public.properties p
where p.published and p.status <> 'Sold'
group by p.location;

grant select on public.location_showcase to anon, authenticated;
