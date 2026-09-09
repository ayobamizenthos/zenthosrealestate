-- Zenthos Real Estate — core schema
-- Run order: 0001_schema.sql, then 0002_rls.sql, then seed.sql

create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------------
-- Enumerated domains
-- Kept as CHECK constraints rather than PG enums so the admin team can extend
-- the lists with a one-line migration instead of an ALTER TYPE dance.
-- ---------------------------------------------------------------------------

create or replace function public.slugify(value text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(value, '')), '[^a-z0-9]+', '-', 'g'));
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles — public-facing user data, mirrored from auth.users on signup
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- admin_users
-- ---------------------------------------------------------------------------

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('super_admin', 'admin')),
  created_at timestamptz not null default now()
);

-- SECURITY DEFINER so admin checks inside RLS policies do not re-enter RLS on
-- admin_users and recurse infinitely.
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = uid);
$$;

revoke execute on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- properties
-- ---------------------------------------------------------------------------

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  title text not null,
  description text not null default '',
  location text not null check (location in ('Victoria Island', 'Lekki', 'Ikoyi', 'Ajah')),
  address text not null default '',
  -- Null when the listing is marketed as "Price on Request".
  price bigint check (price is null or price >= 0),
  price_label text,
  property_type text not null check (
    property_type in ('Detached', 'Semi-detached', 'Duplex', 'Terraced', 'Maisonette')
  ),
  bedrooms integer not null default 0 check (bedrooms >= 0),
  bathrooms integer not null default 0 check (bathrooms >= 0),
  furnished text not null default 'Unfurnished' check (
    furnished in ('Furnished', 'Unfurnished', 'Semi-furnished')
  ),
  amenities text[] not null default '{}',
  images text[] not null default '{}' check (cardinality(images) <= 15),
  featured boolean not null default false,
  status text not null default 'Available' check (status in ('Available', 'Sold', 'Reserved')),
  listing_type text not null check (listing_type in ('Sale', 'Rent', 'Shortlet')),
  -- Drafts stay invisible to the public read policy until the admin publishes.
  published boolean not null default false,
  search_vector tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(location, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(address, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'D')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Appends -2, -3 … when two listings slugify to the same string.
create or replace function public.set_property_slug()
returns trigger
language plpgsql
as $$
declare
  base_slug text;
  candidate text;
  suffix int := 1;
begin
  if tg_op = 'UPDATE'
     and new.title is not distinct from old.title
     and new.location is not distinct from old.location
     and new.slug is not null then
    return new;
  end if;

  base_slug := left(public.slugify(new.title || '-' || new.location), 80);
  if base_slug = '' then
    base_slug := 'property';
  end if;

  candidate := base_slug;
  while exists (select 1 from public.properties where slug = candidate and id is distinct from new.id) loop
    suffix := suffix + 1;
    candidate := base_slug || '-' || suffix;
  end loop;

  new.slug := candidate;
  return new;
end;
$$;

drop trigger if exists properties_set_slug on public.properties;
create trigger properties_set_slug
  before insert or update on public.properties
  for each row execute function public.set_property_slug();

drop trigger if exists properties_touch_updated_at on public.properties;
create trigger properties_touch_updated_at
  before update on public.properties
  for each row execute function public.touch_updated_at();

create index if not exists properties_search_idx on public.properties using gin (search_vector);
create index if not exists properties_title_trgm_idx on public.properties using gin (title gin_trgm_ops);
create index if not exists properties_location_idx on public.properties (location);
create index if not exists properties_listing_type_idx on public.properties (listing_type);
create index if not exists properties_price_idx on public.properties (price);
create index if not exists properties_created_at_idx on public.properties (created_at desc);
-- Drives the homepage showcase without scanning the whole table.
create index if not exists properties_featured_idx on public.properties (featured)
  where featured and published;

-- ---------------------------------------------------------------------------
-- inquiries
-- ---------------------------------------------------------------------------

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete set null,
  -- Set when the sender was signed in, so status updates can notify them back.
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  phone text not null,
  message text not null default '',
  source text not null default 'website' check (source in ('website', 'pwa')),
  status text not null default 'New' check (status in ('New', 'Contacted', 'Closed')),
  created_at timestamptz not null default now()
);

create index if not exists inquiries_status_idx on public.inquiries (status, created_at desc);
create index if not exists inquiries_property_idx on public.inquiries (property_id);

-- ---------------------------------------------------------------------------
-- saved_properties
-- ---------------------------------------------------------------------------

create table if not exists public.saved_properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, property_id)
);

create index if not exists saved_properties_user_idx on public.saved_properties (user_id, created_at desc);
create index if not exists saved_properties_property_idx on public.saved_properties (property_id);

-- ---------------------------------------------------------------------------
-- push_subscriptions — one row per browser/device endpoint
-- ---------------------------------------------------------------------------

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_idx on public.push_subscriptions (user_id);

-- ---------------------------------------------------------------------------
-- notifications — in-app history backing the bell icon and /notifications
-- ---------------------------------------------------------------------------

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (
    kind in ('new_property', 'price_drop', 'status_change', 'new_inquiry', 'inquiry_updated')
  ),
  title text not null,
  body text not null default '',
  url text not null default '/',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);
create index if not exists notifications_unread_idx on public.notifications (user_id) where not read;

-- ---------------------------------------------------------------------------
-- Audience helpers used by the notification fan-out in the app server layer
-- ---------------------------------------------------------------------------

-- Users who saved at least one property in a given location. Backs the
-- "new property in an area you follow" trigger.
create or replace function public.users_following_location(target_location text)
returns table (user_id uuid)
language sql
stable
security definer
set search_path = public
as $$
  select distinct s.user_id
  from public.saved_properties s
  join public.properties p on p.id = s.property_id
  where p.location = target_location;
$$;

revoke execute on function public.users_following_location(text) from public;
grant execute on function public.users_following_location(text) to service_role;
