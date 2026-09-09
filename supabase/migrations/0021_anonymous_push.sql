-- Most visitors never register. A device that has allowed notifications should
-- still hear about a new listing, so a subscription no longer needs an account.
alter table public.push_subscriptions
  alter column user_id drop not null;

-- The endpoint is the device identity. Signing in later attaches the account to
-- the row that already exists rather than creating a second one.
create unique index if not exists push_subscriptions_endpoint_key
  on public.push_subscriptions (endpoint);

create index if not exists push_subscriptions_anonymous_idx
  on public.push_subscriptions (created_at desc)
  where user_id is null;
