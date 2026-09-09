-- Zenthos brokers Lagos only, island and mainland. The state check dated from
-- an earlier plan to cover Abuja; nothing was ever listed there.
alter table public.properties drop constraint if exists properties_state_check;
alter table public.properties add constraint properties_state_check check (
  state = 'Lagos'
);

alter table public.properties alter column state set default 'Lagos';
