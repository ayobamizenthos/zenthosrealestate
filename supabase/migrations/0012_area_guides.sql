create table if not exists public.area_guides (
  location text primary key,
  headline text not null default '',
  overview text not null default '',
  estates text not null default '',
  shopping text not null default '',
  landmarks text not null default '',
  getting_around text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.area_guides enable row level security;

drop policy if exists area_guides_public_read on public.area_guides;
create policy area_guides_public_read on public.area_guides for select using (true);

drop policy if exists area_guides_admin_write on public.area_guides;
create policy area_guides_admin_write on public.area_guides for all
  using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

insert into public.area_guides (location, headline, overview, estates, shopping, landmarks, getting_around) values
(
  'Victoria Island',
  'The commercial heart of Lagos',
  'Victoria Island carries the banks, embassies and multinational headquarters that anchor the Lagos economy. Housing here is built for people who want to walk to work: serviced apartment blocks, compact duplexes and a small number of older detached houses on the quieter streets.',
  'Most residential stock sits off Adeola Odeku, Akin Adesola and Ahmadu Bello Way. Oniru, immediately east, offers newer estate housing at slightly lower entry points.',
  'Retail runs along Adeola Odeku and Akin Adesola. The Palms in Lekki and the shops around Eko Hotel cover most day-to-day needs, and Ozumba Mbadiwe carries the larger showrooms.',
  'Eko Hotel and Suites, Federal Palace Hotel, Civic Centre, Muri Okunola Park and the Eko Atlantic frontage all sit within Victoria Island or on its edge.',
  'Ozumba Mbadiwe and Ahmadu Bello Way carry traffic toward Ikoyi and Lekki. The Lekki-Ikoyi Link Bridge cuts the trip to Ikoyi considerably outside peak hours.'
),
(
  'Ikoyi',
  'The highest values in Lagos',
  'Ikoyi holds the tightest supply and the highest prices on the island. Generous plots, mature tree cover and estate-managed security define it. Listings here often move through relationships before they are ever advertised.',
  'Banana Island, Parkview Estate, Old Ikoyi and Dolphin Estate account for most of the housing. Banana Island is gated and largely detached; Parkview mixes detached houses with newer apartment blocks.',
  'Awolowo Road is the main retail spine. Falomo Shopping Centre and the boutiques around Kingsway Road cover most needs, with larger shopping a short drive across to Victoria Island.',
  'Ikoyi Club 1938, Falomo Bridge, Lagos Motor Boat Club and the Federal Secretariat complex are the landmarks residents navigate by.',
  'Falomo Bridge links Ikoyi to Victoria Island. The Lekki-Ikoyi Link Bridge carries traffic east toward Lekki Phase 1.'
),
(
  'Banana Island',
  'A gated island within Ikoyi',
  'Banana Island is a reclaimed, fully gated development off Ikoyi with underground services, planned drainage and its own security regime. Housing is overwhelmingly detached, with a small number of high-specification apartment blocks.',
  'The estate is planned in lettered zones. Plots are large by Lagos standards and most homes are purpose-built rather than converted.',
  'There is no retail inside the estate. Awolowo Road in Ikoyi and Victoria Island cover shopping, both a short drive away.',
  'The single causeway entrance off Ikoyi is the defining feature, along with the waterfront frontage onto the lagoon.',
  'One controlled entrance from Ikoyi. Everything beyond that runs through Ikoyi and Falomo Bridge.'
),
(
  'Eko Atlantic',
  'A planned city on reclaimed land',
  'Eko Atlantic is built on land reclaimed from the Atlantic beside Victoria Island, planned from scratch with its own power, drainage and road grid. Stock is new-build apartments and towers rather than resale housing.',
  'Development is organised into districts including Eko Pearl, Eko Energy and the Marina district. Most residential supply is apartments in completed or near-complete towers.',
  'Retail is still developing alongside construction. Victoria Island sits immediately behind and covers everything in the interim.',
  'The Great Wall of Lagos sea defence, the Marina waterfront and the boulevard grid are the defining features.',
  'Access is from Victoria Island via Ahmadu Bello Way. The internal grid is new and uncongested.'
),
(
  'Oniru',
  'Beachfront living beside Victoria Island',
  'Oniru sits between Victoria Island and Lekki Phase 1 with direct access to the beachfront. It carries a mix of newer apartment blocks, terraces and detached houses, generally at a lower entry point than Victoria Island itself.',
  'Oniru Private Estate holds most of the residential stock, laid out on a planned grid with a mix of house types.',
  'Landmark Village and the surrounding strip carry restaurants and leisure retail. The Palms in Lekki is a short drive east.',
  'Landmark Beach, Landmark Village, the Oniru royal family compound and Water Corporation Drive define the area.',
  'Ozumba Mbadiwe runs west to Victoria Island; Lekki-Epe Expressway runs east toward Lekki Phase 1.'
),
(
  'Lekki',
  'The widest range of homes on the peninsula',
  'Lekki carries more housing supply than anywhere else on the peninsula and the widest price range with it. Lekki Phase 1 and Ikate suit buyers who want established infrastructure; Chevron, Agungi and Osapa London offer newer terraces and semi-detached homes further east.',
  'Lekki Phase 1, Ikate Elegushi, Osapa London, Agungi, Chevron Drive, Ikota and Victoria Garden City all sit along the corridor, each with its own price profile.',
  'Circle Mall, Lennox Mall, Novare Lekki and The Palms cover formal retail. Admiralty Way in Phase 1 carries the densest concentration of shops and restaurants.',
  'Lekki Conservation Centre, Elegushi Beach, Admiralty Way, the Lekki toll gates and Lekki Conservation Centre are the reference points residents use.',
  'The Lekki-Epe Expressway is the spine, with tolls at intervals. The Lekki-Ikoyi Link Bridge is the fastest route to Ikoyi and Victoria Island.'
),
(
  'Ajah',
  'The most floor area per naira on the corridor',
  'Ajah gives buyers materially more space for the money than anywhere further west on the peninsula. Steady estate development has produced a large supply of newer builds with modern finishes at prices that would not clear a deposit in Lekki Phase 1.',
  'Sangotedo, Abraham Adesanya, Badore, Thomas Estate, Ogombo and Lekki Gardens developments carry most of the housing.',
  'Novare Mall at Sangotedo is the main formal retail anchor, with Ajah Market covering everyday shopping.',
  'Ajah roundabout, Abraham Adesanya roundabout, Lagos Business School and the Novare Mall complex are the main reference points.',
  'The Lekki-Epe Expressway runs through it. Journey times west into Lekki and Victoria Island are the main trade-off for the extra space.'
),
(
  'Ikeja',
  'The state capital and the mainland address that holds value',
  'Ikeja is the administrative capital of Lagos State and the mainland address that has held its value most consistently. Ikeja GRA keeps a low-density, tree-lined character that predates most of the city around it.',
  'Ikeja GRA carries the premium housing. Opebi, Allen Avenue and Oregun mix residential with commercial frontage, and Magodo sits on the eastern edge.',
  'Ikeja City Mall is the main anchor. Computer Village at Otigba is the largest electronics market in West Africa, and Allen Avenue carries dense street retail.',
  'Murtala Muhammed International Airport, the Lagos State Secretariat at Alausa, Ikeja City Mall and Computer Village define the area.',
  'Proximity to both airport terminals makes it the practical choice for frequent travellers. Ikorodu Road and Agidingbi Road carry traffic toward the rest of the mainland.'
),
(
  'Magodo',
  'The mainland answer to a gated estate',
  'Magodo GRA is planned, gated and managed, with wide roads and estate security across both phases. Plot sizes run generous by Lagos standards, so detached duplexes with real compounds are the norm rather than the exception.',
  'Magodo GRA Phase 1 and Phase 2 hold most of the stock, with Shangisha adjoining. Phase 2 is the larger and more recently developed.',
  'Everyday shopping runs along CMD Road and Berger. Ikeja City Mall is a short drive west.',
  'CMD Road, the Magodo gates, Shangisha and the Lagos-Ibadan Expressway access point are the main reference points.',
  'CMD Road connects to the Lagos-Ibadan Expressway and Berger. Access to Ikeja and the airport is straightforward outside peak hours.'
),
(
  'Omole',
  'Planned low-density living off Berger',
  'Omole is a planned residential scheme laid out in two phases, quiet and low-density by Lagos standards, with a strong resident association presence in both.',
  'Omole Phase 1 and Phase 2 are the two schemes, with Ojodu Berger and Isheri adjoining.',
  'Berger and Ojodu carry everyday retail. Ikeja City Mall is the nearest formal mall.',
  'The Omole gates, Ojodu Berger bus terminal, Isheri and the Lagos-Ibadan Expressway interchange define the area.',
  'Direct access to the Lagos-Ibadan Expressway. Berger is the main interchange for onward travel.'
),
(
  'Maryland',
  'Central mainland with everything in walking distance',
  'Maryland sits at the junction of Ikorodu Road and the routes toward Ikeja and Yaba, which makes it one of the better-connected mainland addresses. Housing is a mix of older detached houses and newer apartment blocks.',
  'Mende Estate carries most of the low-density housing. The area around Ikorodu Road is denser and more commercial.',
  'Maryland Mall is the main anchor, with Mega Plaza and dense street retail along Ikorodu Road.',
  'Maryland Mall, Mende, Ikorodu Road and the Anthony interchange are the reference points.',
  'Ikorodu Road runs through it toward Yaba and the island. Ikeja is a short drive north.'
),
(
  'Gbagada',
  'Quiet streets with fast access to the island',
  'Gbagada offers a calmer residential feel than most of the central mainland while keeping quick access to the Third Mainland Bridge. It is a common choice for buyers who work on the island but do not want island prices.',
  'Gbagada Phase 1 and Phase 2 hold most of the planned housing, with Ifako, Soluyi and Medina adjoining.',
  'Everyday shopping runs along Diya Street and the Gbagada Expressway. Maryland Mall is a short drive north.',
  'Gbagada General Hospital, the Gbagada Expressway, Ifako and the Third Mainland Bridge approach define the area.',
  'The Third Mainland Bridge approach is the main advantage, putting Lagos Island within reach outside peak hours.'
)
on conflict (location) do nothing;
