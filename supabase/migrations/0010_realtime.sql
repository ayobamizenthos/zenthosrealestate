-- Realtime broadcast so a listing published from the admin panel appears on
-- every open device immediately, without a refresh.
--
-- `properties` is safe to broadcast because RLS still applies to realtime
-- payloads: anonymous subscribers only ever receive published rows.

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'properties'
  ) then
    alter publication supabase_realtime add table public.properties;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end
$$;
