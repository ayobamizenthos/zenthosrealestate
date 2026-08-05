alter table public.properties
  add column if not exists featured_rank integer;

create index if not exists properties_featured_rank_idx
  on public.properties (featured_rank)
  where featured is true;

-- Seed the order from what the homepage already shows so nothing jumps the
-- first time an admin opens the ordering screen.
with ranked as (
  select id, row_number() over (order by created_at desc) as position
  from public.properties
  where featured is true
)
update public.properties p
set featured_rank = ranked.position
from ranked
where ranked.id = p.id and p.featured_rank is null;
