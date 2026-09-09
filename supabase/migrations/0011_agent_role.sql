-- Agents are cooperating brokers. They sign in, browse, save, download full
-- photo sets and are alerted to every new listing — but they never post.
--
-- Posting rights come from membership of `admin_users`, and agents are
-- deliberately not in that table, so "cannot post" is enforced by the same
-- check that already guards every /admin route rather than by a second rule
-- that could drift out of step with it.

alter table public.profiles
  add column if not exists role text not null default 'buyer'
    check (role in ('buyer', 'agent'));

create index if not exists profiles_role_idx on public.profiles (role) where role = 'agent';

-- Fan-out audience for a newly published listing: everyone who has shown
-- interest in that area, plus every agent regardless of area. An agent with an
-- empty saved list previously received nothing, which defeated the point.
create or replace function public.notification_audience(target_location text)
returns table (user_id uuid)
language sql
stable
security definer
set search_path = public
as $$
  select distinct s.user_id
  from public.saved_properties s
  join public.properties p on p.id = s.property_id
  where p.location = target_location

  union

  select id from public.profiles where role = 'agent'
$$;

revoke execute on function public.notification_audience(text) from public;
grant execute on function public.notification_audience(text) to service_role;

-- Agents may read every published listing's full record, which is already the
-- case for anonymous visitors; no extra grant is needed. This comment records
-- that the omission is deliberate rather than an oversight.
