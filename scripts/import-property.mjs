import { readFile, readdir } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'

const PROPERTY_TYPES = [
  'Studio Apartment',
  'Apartment',
  'Penthouse',
  'Maisonette',
  'Detached Duplex',
  'Semi-detached Duplex',
  'Terraced Duplex',
  'Detached Bungalow',
  'Semi-detached Bungalow',
  'Terraced Bungalow',
]

const LOCATIONS = [
  'Victoria Island',
  'Banana Island',
  'Eko Atlantic',
  'Ikoyi',
  'Lekki',
  'Ajah',
  'Oniru',
  'Ikeja',
  'Yaba',
  'Surulere',
  'Magodo',
  'Gbagada',
  'Maryland',
  'Ogudu',
  'Omole',
  'Maitama',
  'Asokoro',
  'Wuse',
  'Gwarinpa',
  'Jabi',
  'Katampe',
  'Guzape',
  'Lokogoma',
].sort((a, b) => b.length - a.length)

const STATES = ['Lagos', 'Abuja']

const folder = process.argv.slice(2).join(' ').trim()
if (!folder) {
  console.error('Usage: npm run import -- "<folder>"')
  process.exit(1)
}

const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !cloudName || !uploadPreset) {
  console.error('Missing Supabase or Cloudinary environment variables. Check .env.local.')
  process.exit(1)
}

function parsePrice(token) {
  const match = /^([\d.]+)\s*([mMbBkK]?)$/.exec(token.trim())
  if (!match) return null

  const amount = Number.parseFloat(match[1])
  if (!Number.isFinite(amount)) return null

  const scale = { m: 1e6, b: 1e9, k: 1e3 }[match[2].toLowerCase()] ?? 1
  return Math.round(amount * scale)
}

function matchFromList(candidate, list) {
  const normalised = candidate.trim().toLowerCase()
  return list.find(entry => entry.toLowerCase() === normalised) ?? null
}

function parseFolderName(name) {
  const shape = /^(\d+)\s+Bedrooms?\s+(.+?)\s+([\d.]+\s*[MmBbKk]?)\s*-\s*(.+?)\s*,\s*(.+)$/.exec(
    name.trim()
  )

  if (!shape) {
    throw new Error(
      `Folder name must read "<n> Bedroom <Type> <Price>-<Area>, <State>".
       Got: "${name}"`
    )
  }

  const [, bedsRaw, typeRaw, priceRaw, addressRaw, stateRaw] = shape

  const bedrooms = Number.parseInt(bedsRaw, 10)

  const price = parsePrice(priceRaw)
  if (price === null) throw new Error(`Could not read price "${priceRaw}" in: "${name}"`)

  const propertyType = matchFromList(typeRaw, PROPERTY_TYPES)
  if (!propertyType) {
    throw new Error(
      `Unknown property type "${typeRaw}".
       Expected one of: ${PROPERTY_TYPES.join(', ')}`
    )
  }

  const state = matchFromList(stateRaw, STATES)
  if (!state) throw new Error(`Unknown state "${stateRaw}". Expected Lagos or Abuja.`)

  const address = addressRaw.trim()

  const location = LOCATIONS.find(area => address.toLowerCase().includes(area.toLowerCase()))
  if (!location) {
    throw new Error(
      `Could not place "${address}" in a known area.
       Expected the address to contain one of: ${LOCATIONS.join(', ')}`
    )
  }

  return { bedrooms, propertyType, price, address, location, state }
}

async function uploadImage(filePath) {
  const body = new FormData()
  const bytes = await readFile(filePath)
  body.append('file', new Blob([bytes]), basename(filePath))
  body.append('upload_preset', uploadPreset)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body,
  })

  if (!response.ok)
    throw new Error(`Cloudinary rejected ${basename(filePath)}: ${await response.text()}`)

  const result = await response.json()
  return result.secure_url
}

const details = parseFolderName(basename(folder))
console.log(
  `\n${details.bedrooms} bed ${details.propertyType} in ${details.location} — ₦${details.price.toLocaleString()}\n`
)

const files = (await readdir(folder))
  .filter(name => /\.(jpe?g|png|webp)$/i.test(name))

  .sort((a, b) => {
    const toNumber = value => Number.parseInt(basename(value, extname(value)), 10)
    const left = toNumber(a)
    const right = toNumber(b)
    if (Number.isFinite(left) && Number.isFinite(right)) return left - right
    return a.localeCompare(b)
  })

if (!files.length) {
  console.error('No images found in that folder.')
  process.exit(1)
}

console.log(`Uploading ${files.length} photos in order…`)
const images = []
for (const [index, file] of files.entries()) {
  process.stdout.write(`  ${index + 1}. ${file} … `)
  images.push(await uploadImage(join(folder, file)))
  console.log('ok')
}

const title = `${details.bedrooms} Bedroom ${details.propertyType}`
const description = `${details.bedrooms} bedroom ${details.propertyType.toLowerCase()} at ${details.address}, ${details.state}. We inspected this home and verified its documents before listing it. Message us on WhatsApp to arrange a viewing.`

const payload = {
  title,
  description,
  location: details.location,
  address: details.address,
  state: details.state,
  price: details.price,
  property_type: details.propertyType,
  bedrooms: details.bedrooms,
  bathrooms: details.bedrooms,
  toilets: details.bedrooms + 1,
  listing_type: 'Sale',
  status: 'Available',
  amenities: [],
  images,
  featured: false,
  verified: true,
  serviced: false,
  published: true,
}

const insert = await fetch(`${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/properties`, {
  method: 'POST',
  headers: {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  },
  body: JSON.stringify(payload),
})

if (!insert.ok) {
  console.error(`\nSupabase rejected the listing: ${await insert.text()}`)
  process.exit(1)
}

const [created] = await insert.json()
console.log(`\nPublished: ${title}`)
console.log(`  /properties/${created.slug}`)
console.log(`  Reference ${created.reference_code}`)
console.log(`\nRefine the details at /admin/properties/edit/${created.id}`)
