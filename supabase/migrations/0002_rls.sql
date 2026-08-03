-- Zenthos Real Estate — row level security
-- Every table is deny-by-default; each policy below is the complete list of
-- what anon and authenticated callers may do.

-- Blunt the edges of the public inquiry form before opening it to anon.
alter table public.inquiries
  drop constraint if exists inquiries_reasonable_lengths;
alter table public.inquiries
  add constraint inquiries_reasonable_lengths check (
    char_length(name) between 1 and 120
    and char_length(email) between 3 and 200
    and char_length(phone) between 6 and 40
    and char_length(message) <= 2000
  );

alter table public.profiles enable row level security;
alter table public.admin_users enable row level security;
alter table public.properties enable row level security;
alter table public.inquiries enable row level security;
alter table public.saved_properties enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.notifications enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.properties to anon, authenticated;
grant insert on public.inquiries to anon, authenticated;
grant select, insert, update, delete on public.saved_properties to authenticated;
grant select, update on public.profiles to authenticated;
grant select on public.admin_users to authenticated;
grant select, insert, update, delete on public.push_subscriptions to authenticated;
grant select, update on public.notifications to authenticated;
grant select, update on public.inquiries to authenticated;

-- ---------------------------------------------------------------------------
-- properties: published listings are world-readable; only admins write.
-- ---------------------------------------------------------------------------

drop policy if exists properties_public_read on public.properties;
create policy properties_public_read on public.properties
  for select to anon, authenticated
  using (published);

drop policy if exists properties_admin_read_all on public.properties;
create policy properties_admin_read_all on public.properties
  for select to authenticated
  using (public.is_admin(auth.uid()));

drop policy if exists properties_admin_insert on public.properties;
create policy properties_admin_insert on public.properties
  for insert to authenticated
  with check (public.is_admin(auth.uid()));

drop policy if exists properties_admin_update on public.properties;
create policy properties_admin_update on public.properties
  for update to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists properties_admin_delete on public.properties;
create policy properties_admin_delete on public.properties
  for delete to authenticated
  using (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- inquiries: anyone may submit; only admins (and the sender) may read.
-- ---------------------------------------------------------------------------

drop policy if exists inquiries_public_insert on public.inquiries;
create policy inquiries_public_insert on public.inquiries
  for insert to anon, authenticated
  with check (
    -- An anonymous submission must not claim to belong to a signed-in user.
    user_id is null or user_id = auth.uid()
  );

drop policy if exists inquiries_admin_read on public.inquiries;
create policy inquiries_admin_read on public.inquiries
  for select to authenticated
  using (public.is_admin(auth.uid()));

drop policy if exists inquiries_own_read on public.inquiries;
create policy inquiries_own_read on public.inquiries
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists inquiries_admin_update on public.inquiries;
create policy inquiries_admin_update on public.inquiries
  for update to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- saved_properties: strictly the owner's own rows.
-- ---------------------------------------------------------------------------

drop policy if exists saved_properties_own_all on public.saved_properties;
create policy saved_properties_own_all on public.saved_properties
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

drop policy if exists profiles_own_read on public.profiles;
create policy profiles_own_read on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists profiles_own_update on public.profiles;
create policy profiles_own_update on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- admin_users: readable only by admins. Membership changes are service-role
-- only — no policy grants INSERT/UPDATE/DELETE to a logged-in user, so an
-- admin cannot promote anyone from the browser.
-- ---------------------------------------------------------------------------

drop policy if exists admin_users_admin_read on public.admin_users;
create policy admin_users_admin_read on public.admin_users
  for select to authenticated
  using (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- push_subscriptions: a device row belongs to its signed-in owner.
-- ---------------------------------------------------------------------------

drop policy if exists push_subscriptions_own_all on public.push_subscriptions;
create policy push_subscriptions_own_all on public.push_subscriptions
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- notifications: the recipient reads and marks them read. Rows are only ever
-- created by the server (service role), never by a browser.
-- ---------------------------------------------------------------------------

drop policy if exists notifications_own_read on public.notifications;
create policy notifications_own_read on public.notifications
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists notifications_own_update on public.notifications;
create policy notifications_own_update on public.notifications
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
