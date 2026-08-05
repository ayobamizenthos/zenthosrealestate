update public.properties
set amenities = (
  select coalesce(array_agg(distinct renamed order by renamed), '{}')
  from (
    select case
      when amenity = 'Security' then 'Security House'
      when amenity = 'Boys'' Quarters' then 'BQ'
      else amenity
    end as renamed
    from unnest(amenities) as amenity
    where amenity <> 'Borehole'
  ) as mapped
)
where amenities && array['Security', 'Boys'' Quarters', 'Borehole'];
