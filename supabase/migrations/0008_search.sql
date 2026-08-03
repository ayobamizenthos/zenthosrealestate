-- One search entry point for the whole product. It has to cope with how people
-- actually type: "2bedroom", "2 bed lekki", "semi detached", "govenor consent",
-- "ZEN-B88144" — and return something sensible before the user stops typing.

create or replace function public.search_properties(
  q text,
  max_results integer default 60
)
returns setof public.properties
language sql
stable
as $$
  with parsed as (
    select
      -- "2bedroom", "2-bed", "2 br", "2 beds" all yield 2.
      nullif((regexp_match(lower(coalesce(q, '')), '(\d+)\s*-?\s*(?:bed|bedroom|bedrooms|br)\b'))[1], '')::int
        as beds,
      -- Strip the bedroom clause and punctuation so the remainder is pure terms.
      trim(regexp_replace(
        regexp_replace(lower(coalesce(q, '')), '(\d+)\s*-?\s*(?:bed|bedrooms?|br)\b', ' ', 'g'),
        '[^a-z0-9\-'' ]', ' ', 'g'
      )) as terms
  )
  select p.*
  from public.properties p, parsed
  where p.published
    and (parsed.beds is null or p.bedrooms = parsed.beds)
    and (
      parsed.terms = ''
      -- Whole-word matches first: fast, index-backed.
      or p.search_vector @@ plainto_tsquery('simple', parsed.terms)
      -- Substring matches catch partially typed words as the user types.
      or p.title ilike '%' || parsed.terms || '%'
      or p.location ilike '%' || parsed.terms || '%'
      or p.address ilike '%' || parsed.terms || '%'
      or p.property_type ilike '%' || parsed.terms || '%'
      or p.reference_code ilike '%' || parsed.terms || '%'
      or coalesce(p.title_document, '') ilike '%' || parsed.terms || '%'
      -- Trigram similarity is the safety net for typos and joined words.
      or similarity(p.property_type, parsed.terms) > 0.25
      or similarity(p.location, parsed.terms) > 0.25
      or similarity(p.title, parsed.terms) > 0.2
    )
  order by
    -- Newest first is the brokerage's rule; featured only breaks ties.
    p.created_at desc,
    p.featured desc
  limit greatest(1, least(max_results, 200));
$$;

grant execute on function public.search_properties(text, integer) to anon, authenticated;

-- Distinct areas that currently hold stock, for the search overlay's shortcuts.
create or replace view public.active_locations
with (security_invoker = on) as
select p.state, p.location, count(*)::int as property_count
from public.properties p
where p.published
group by p.state, p.location
order by p.state, p.location;

grant select on public.active_locations to anon, authenticated;
