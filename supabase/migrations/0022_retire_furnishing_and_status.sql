-- Furnishing was noise on a sale listing, and status only ever read "Available"
-- because an unavailable property gets unpublished instead. Both leave the
-- product. The columns stay with defaults so historical rows are preserved and
-- inserts no longer have to supply them.
alter table public.properties
  alter column furnished set default 'Unfurnished',
  alter column status set default 'Available';

drop index if exists properties_furnished_idx;
