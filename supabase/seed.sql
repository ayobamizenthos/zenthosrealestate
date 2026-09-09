-- Zenthos Real Estate — development seed
--
-- Listings only. The super admin is promoted separately by `npm run make-admin`,
-- because the account has to exist in Supabase Auth first.

-- ---------------------------------------------------------------------------
-- Sample listings. Images point at picsum.photos so the seed never 404s;
-- replace them with real Cloudinary uploads before launch.
-- ---------------------------------------------------------------------------

insert into public.properties (
  title, description, location, address, price, price_label, property_type,
  bedrooms, bathrooms, furnished, amenities, images, featured, status,
  listing_type, published
) values
(
  '4 Bedroom Detached Duplex',
  'A well-proportioned four bedroom detached duplex on a quiet residential street in Lekki Phase 1. The ground floor opens into a double-volume living area that runs the full depth of the house, with a separate family lounge and a fitted kitchen finished in matte lacquer. All four bedrooms are en-suite, and the master occupies the rear of the first floor with a private balcony over the garden. A two-room boys quarters sits behind the main building, and the compound parks four cars comfortably.',
  'Lekki', 'Off Admiralty Way, Lekki Phase 1', 285000000, null, 'Detached',
  4, 5, 'Unfurnished',
  array['Swimming Pool', '24hr Power', 'Security', 'Parking', 'Garden', 'Boys'' Quarters', 'Fitted Kitchen'],
  array[
    'https://picsum.photos/seed/zenthos-lekki-duplex-1/1600/1000',
    'https://picsum.photos/seed/zenthos-lekki-duplex-2/1600/1000',
    'https://picsum.photos/seed/zenthos-lekki-duplex-3/1600/1000',
    'https://picsum.photos/seed/zenthos-lekki-duplex-4/1600/1000'
  ],
  true, 'Available', 'Sale', true
),
(
  '3 Bedroom Serviced Apartment',
  'Third floor apartment in a serviced block two minutes from Ozumba Mbadiwe. Open-plan living and dining with floor-to-ceiling glazing on the lagoon side, three en-suite bedrooms, and a utility room off the kitchen. Service charge covers 24 hour power, water treatment, cleaning of common areas and a manned gatehouse. Suits a professional couple or a small family that wants zero maintenance overhead.',
  'Victoria Island', 'Ozumba Mbadiwe Avenue, Victoria Island', 6500000, null, 'Maisonette',
  3, 4, 'Furnished',
  array['24hr Power', 'Security', 'Parking', 'Elevator', 'Gym', 'Air Conditioning', 'CCTV'],
  array[
    'https://picsum.photos/seed/zenthos-vi-apartment-1/1600/1000',
    'https://picsum.photos/seed/zenthos-vi-apartment-2/1600/1000',
    'https://picsum.photos/seed/zenthos-vi-apartment-3/1600/1000'
  ],
  true, 'Available', 'Rent', true
),
(
  '5 Bedroom Detached House with Pool',
  'A substantial family house on just under a thousand square metres in Parkview Estate. Formal and informal living rooms flank a central staircase, and the rear elevation opens onto a covered terrace and a tiled pool. Five en-suite bedrooms upstairs including a master suite with dressing room and study. Estate security is managed and the street is fully tarred with underground drainage.',
  'Ikoyi', 'Parkview Estate, Ikoyi', 950000000, null, 'Detached',
  5, 6, 'Semi-furnished',
  array['Swimming Pool', 'Gym', '24hr Power', 'Security', 'Parking', 'Garden', 'Boys'' Quarters', 'CCTV', 'Cinema Room'],
  array[
    'https://picsum.photos/seed/zenthos-ikoyi-house-1/1600/1000',
    'https://picsum.photos/seed/zenthos-ikoyi-house-2/1600/1000',
    'https://picsum.photos/seed/zenthos-ikoyi-house-3/1600/1000',
    'https://picsum.photos/seed/zenthos-ikoyi-house-4/1600/1000',
    'https://picsum.photos/seed/zenthos-ikoyi-house-5/1600/1000'
  ],
  true, 'Available', 'Sale', true
),
(
  '4 Bedroom Terraced Duplex',
  'End-unit terrace in a gated development of twelve houses in Ikate. Living and dining on the ground floor with a guest toilet and a rear kitchen that opens to a small service yard. Three bedrooms on the first floor, with the master and a fourth bedroom above. Shared borehole, treatment plant and a dedicated transformer for the estate.',
  'Lekki', 'Ikate Elegushi, Lekki', 145000000, null, 'Terraced',
  4, 4, 'Unfurnished',
  array['24hr Power', 'Security', 'Parking', 'Borehole', 'Boys'' Quarters'],
  array[
    'https://picsum.photos/seed/zenthos-ikate-terrace-1/1600/1000',
    'https://picsum.photos/seed/zenthos-ikate-terrace-2/1600/1000',
    'https://picsum.photos/seed/zenthos-ikate-terrace-3/1600/1000'
  ],
  false, 'Available', 'Sale', true
),
(
  '3 Bedroom Semi-detached Duplex',
  'Newly completed semi-detached duplex in a small estate off the Lekki-Epe expressway at Sangotedo. Porcelain floors throughout the ground level, fitted kitchen with breakfast bar, and three en-suite bedrooms upstairs. One-room boys quarters and parking for two cars within the gate. Documentation is a registered survey with governor''s consent in progress.',
  'Ajah', 'Sangotedo, Ajah', 78000000, null, 'Semi-detached',
  3, 4, 'Unfurnished',
  array['24hr Power', 'Security', 'Parking', 'Borehole', 'Fitted Kitchen', 'Boys'' Quarters'],
  array[
    'https://picsum.photos/seed/zenthos-ajah-semi-1/1600/1000',
    'https://picsum.photos/seed/zenthos-ajah-semi-2/1600/1000',
    'https://picsum.photos/seed/zenthos-ajah-semi-3/1600/1000'
  ],
  true, 'Available', 'Sale', true
),
(
  '2 Bedroom Shortlet Apartment',
  'Fully furnished two bedroom on the sixth floor of a managed block in Victoria Island, available nightly with a three night minimum. Both bedrooms en-suite, smart TV in the living room, full kitchen with washer-dryer, and a workspace with fibre internet. Rate includes power, water, weekly housekeeping and access to the building gym.',
  'Victoria Island', 'Adeola Odeku Street, Victoria Island', 185000, null, 'Maisonette',
  2, 3, 'Furnished',
  array['24hr Power', 'Security', 'Elevator', 'Gym', 'Air Conditioning', 'Parking', 'CCTV'],
  array[
    'https://picsum.photos/seed/zenthos-vi-shortlet-1/1600/1000',
    'https://picsum.photos/seed/zenthos-vi-shortlet-2/1600/1000',
    'https://picsum.photos/seed/zenthos-vi-shortlet-3/1600/1000'
  ],
  false, 'Available', 'Shortlet', true
),
(
  '6 Bedroom Detached House, Banana Island',
  'A waterfront house on Banana Island offered on a discreet basis. Six en-suite bedrooms across two upper floors, a full basement with cinema and gym, staff accommodation for four, and a private jetty. Viewings are arranged by appointment only and proof of funds is required before an inspection is scheduled.',
  'Ikoyi', 'Banana Island, Ikoyi', null, 'Price on Request', 'Detached',
  6, 8, 'Furnished',
  array['Swimming Pool', 'Gym', '24hr Power', 'Security', 'Parking', 'Garden', 'Boys'' Quarters', 'CCTV', 'Cinema Room', 'Elevator'],
  array[
    'https://picsum.photos/seed/zenthos-banana-island-1/1600/1000',
    'https://picsum.photos/seed/zenthos-banana-island-2/1600/1000',
    'https://picsum.photos/seed/zenthos-banana-island-3/1600/1000',
    'https://picsum.photos/seed/zenthos-banana-island-4/1600/1000'
  ],
  true, 'Available', 'Sale', true
),
(
  '4 Bedroom Maisonette',
  'Upper maisonette in a converted block on Abraham Adesanya, with its own street entrance and no shared internal spaces. Living area and kitchen on the entry level, four bedrooms above, and a roof terrace with a view over the estate. Well suited to a family that wants house-like space at apartment pricing.',
  'Ajah', 'Abraham Adesanya Estate, Ajah', 52000000, null, 'Maisonette',
  4, 3, 'Unfurnished',
  array['24hr Power', 'Security', 'Parking', 'Borehole', 'Balcony'],
  array[
    'https://picsum.photos/seed/zenthos-ajah-maisonette-1/1600/1000',
    'https://picsum.photos/seed/zenthos-ajah-maisonette-2/1600/1000'
  ],
  false, 'Reserved', 'Sale', true
);
