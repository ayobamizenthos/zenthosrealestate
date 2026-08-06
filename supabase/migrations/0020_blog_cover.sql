-- Journal covers carry an alt line for search and screen readers, and a credit
-- line because the photography is licensed from third parties.
alter table public.blog_posts
  add column if not exists cover_alt text not null default '',
  add column if not exists cover_credit text not null default '';
