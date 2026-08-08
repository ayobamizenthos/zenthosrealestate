-- We broker built houses, not land. Excision, gazette, a registered survey and
-- a family receipt describe stages of a land purchase, never the title a
-- finished home changes hands on. No listing used them.
alter table public.properties drop constraint if exists properties_title_document_check;
alter table public.properties add constraint properties_title_document_check check (
  title_document is null or title_document in (
    'Governor''s Consent',
    'Certificate of Occupancy',
    'Deed of Assignment'
  )
);
