create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  cover_image text,
  category text not null default 'Market insight',
  read_minutes integer not null default 4,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_published_idx
  on public.blog_posts (published_at desc)
  where published is true;

alter table public.blog_posts enable row level security;

drop policy if exists "Published posts are public" on public.blog_posts;
create policy "Published posts are public"
  on public.blog_posts for select
  using (published is true or public.is_admin(auth.uid()));

drop policy if exists "Admins manage posts" on public.blog_posts;
create policy "Admins manage posts"
  on public.blog_posts for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create or replace function public.touch_blog_post()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  if new.published and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists blog_posts_touch on public.blog_posts;
create trigger blog_posts_touch
  before insert or update on public.blog_posts
  for each row execute function public.touch_blog_post();
