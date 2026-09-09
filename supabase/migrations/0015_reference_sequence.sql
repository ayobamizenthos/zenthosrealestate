create sequence if not exists public.property_reference_seq start with 1000;

create or replace function public.assign_reference_code()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.reference_code is null or new.reference_code = '' then
    new.reference_code := 'ZEN-' || nextval('public.property_reference_seq');
  end if;
  return new;
end;
$$;

drop trigger if exists properties_reference_code on public.properties;

create trigger properties_reference_code
  before insert on public.properties
  for each row execute function public.assign_reference_code();

-- Replace the random hex codes with sequential ones in listing order, then move
-- the sequence past the highest number so new inserts continue the run.
with renumbered as (
  select id, 999 + row_number() over (order by created_at, id) as seq
  from public.properties
)
update public.properties p
set reference_code = 'ZEN-' || renumbered.seq
from renumbered
where renumbered.id = p.id;

select setval(
  'public.property_reference_seq',
  coalesce((select max(split_part(reference_code, '-', 2)::bigint) from public.properties), 999)
);

create unique index if not exists properties_reference_code_key
  on public.properties (reference_code);
