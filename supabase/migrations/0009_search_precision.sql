-- Two precision bugs in search_properties:
--
-- 1. `\b` is a backspace character in Postgres regexes, not a word boundary —
--    that is `\y`. So "2bedroom" never yielded a bedroom count and fell through
--    to fuzzy matching, which returned every listing.
-- 2. The trigram thresholds were low enough that a two-word phrase matched
--    almost any title, so "semi detached" returned detached duplexes.

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
      -- Longest alternative first: ARE prefers the leftmost match, so "bed"
      -- would otherwise win against "bedroom" and strand the "room".
      nullif(
        (regexp_match(
          lower(coalesce(q, '')),
          '(\d+)\s*-?\s*(?:bedrooms|bedroom|beds|bed|br)\y'
        ))[1],
        ''
      )::int as beds,
      trim(regexp_replace(
        regexp_replace(
          lower(coalesce(q, '')),
          '(\d+)\s*-?\s*(?:bedrooms|bedroom|beds|bed|br)\y', ' ', 'g'
        ),
        '[^a-z0-9\-'' ]', ' ', 'g'
      )) as terms
  )
  select p.*
  from public.properties p, parsed
  where p.published
    and (parsed.beds is null or p.bedrooms = parsed.beds)
    and (
      parsed.terms = ''
      or p.search_vector @@ plainto_tsquery('simple', parsed.terms)
      or p.title ilike '%' || parsed.terms || '%'
      or p.location ilike '%' || parsed.terms || '%'
      or p.address ilike '%' || parsed.terms || '%'
      or p.property_type ilike '%' || parsed.terms || '%'
      or p.reference_code ilike '%' || parsed.terms || '%'
      or coalesce(p.title_document, '') ilike '%' || parsed.terms || '%'
      -- Fuzzy is the last resort, and only for terms long enough to be
      -- meaningful. 0.5 is measured, not guessed: real typos score 0.58-0.67
      -- against the intended word, while unrelated words score 0.10 or less.
      or (
        length(parsed.terms) >= 4
        and (
          word_similarity(parsed.terms, p.property_type) > 0.5
          or word_similarity(parsed.terms, p.location) > 0.5
          or word_similarity(parsed.terms, p.title) > 0.5
        )
      )
    )
  order by
    p.created_at desc,
    p.featured desc
  limit greatest(1, least(max_results, 200));
$$;

grant execute on function public.search_properties(text, integer) to anon, authenticated;
