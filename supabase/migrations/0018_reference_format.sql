-- References read as identifiers rather than a visible listing count, so the
-- digits are drawn at random and retried on the unique index rather than taken
-- from a sequence.
create or replace function public.assign_reference_code()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  candidate text;
begin
  if new.reference_code is not null and new.reference_code <> '' then
    return new;
  end if;

  loop
    candidate := 'ZN-' ||
      lpad((floor(random() * 900) + 100)::int::text, 3, '0') || '-' ||
      lpad((floor(random() * 900) + 100)::int::text, 3, '0');

    exit when not exists (
      select 1 from public.properties where reference_code = candidate
    );
  end loop;

  new.reference_code := candidate;
  return new;
end;
$$;

do $$
declare
  listing record;
  candidate text;
begin
  for listing in select id from public.properties loop
    loop
      candidate := 'ZN-' ||
        lpad((floor(random() * 900) + 100)::int::text, 3, '0') || '-' ||
        lpad((floor(random() * 900) + 100)::int::text, 3, '0');

      exit when not exists (
        select 1 from public.properties where reference_code = candidate
      );
    end loop;

    update public.properties set reference_code = candidate where id = listing.id;
  end loop;
end;
$$;

drop sequence if exists public.property_reference_seq;
