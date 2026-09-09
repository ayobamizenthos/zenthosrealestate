import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'

const BRAND = '#800020'
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 }

const PUBLIC_DIR = join(process.cwd(), 'public')
const ICONS_DIR = join(PUBLIC_DIR, 'icons')
const APP_DIR = join(process.cwd(), 'src', 'app')

const SOURCES = {
  markWhite: join(PUBLIC_DIR, 'ZENTHOS RE LOGO SINGLE_WHITE.png'),
  markBurgundy: join(PUBLIC_DIR, 'ZENTHOS RE LOGO SINGLE_BURG.png'),
  lockupWhite: join(PUBLIC_DIR, 'ZENTHOS RE LOGO_WHITE.png'),
  lockupBurgundy: join(PUBLIC_DIR, 'ZENTHOS RE LOGO_BURG.png'),
}

const markWhite = SOURCES.markWhite

async function trimTo(source, target) {
  const buffer = await sharp(source).trim({ threshold: 10 }).png().toBuffer()
  await writeFile(join(PUBLIC_DIR, target), buffer)
}

async function bare(size, padding) {
  const inner = Math.max(1, Math.round(size * (1 - padding * 2)))

  const trimmed = await sharp(SOURCES.markWhite).trim({ threshold: 10 }).toBuffer()
  const fitted = await sharp(trimmed)
    .resize(inner, inner, { fit: 'contain', background: TRANSPARENT })
    .toBuffer()

  return sharp({ create: { width: size, height: size, channels: 4, background: TRANSPARENT } })
    .composite([{ input: fitted, gravity: 'centre' }])
    .png()
    .toBuffer()
}

async function tile(size, padding) {
  const inner = Math.max(1, Math.round(size * (1 - padding * 2)))

  const trimmed = await sharp(markWhite).trim({ threshold: 10 }).toBuffer()
  const fitted = await sharp(trimmed)
    .resize(inner, inner, { fit: 'contain', background: TRANSPARENT })
    .toBuffer()

  return sharp({ create: { width: size, height: size, channels: 4, background: BRAND } })
    .composite([{ input: fitted, gravity: 'centre' }])
    .png()
    .toBuffer()
}

async function writeIco(target, sizes) {
  const images = await Promise.all(sizes.map(size => bare(size, 0.04)))

  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(images.length, 4)

  const entries = []
  let offset = 6 + images.length * 16

  images.forEach((image, index) => {
    const entry = Buffer.alloc(16)
    const size = sizes[index]
    entry.writeUInt8(size >= 256 ? 0 : size, 0)
    entry.writeUInt8(size >= 256 ? 0 : size, 1)
    entry.writeUInt16LE(1, 4)
    entry.writeUInt16LE(32, 6)
    entry.writeUInt32LE(image.length, 8)
    entry.writeUInt32LE(offset, 12)
    entries.push(entry)
    offset += image.length
  })

  await writeFile(target, Buffer.concat([header, ...entries, ...images]))
}

await mkdir(ICONS_DIR, { recursive: true })

await writeFile(join(APP_DIR, 'icon.png'), await bare(512, 0.04))
await writeFile(join(APP_DIR, 'apple-icon.png'), await tile(180, 0.1))
await writeIco(join(APP_DIR, 'favicon.ico'), [16, 32, 48])

// Google only shows a favicon in search results when it is square and a
// multiple of 48px. The .ico carries a 48 variant, but Next advertises that
// file as 16x16, so the size Google trusts is published separately.
await writeFile(join(ICONS_DIR, 'icon-48.png'), await tile(48, 0.08))
await writeFile(join(ICONS_DIR, 'icon-192.png'), await tile(192, 0.08))
await writeFile(join(ICONS_DIR, 'icon-512.png'), await tile(512, 0.08))
await writeFile(join(ICONS_DIR, 'apple-touch-icon.png'), await tile(180, 0.1))
await writeFile(join(ICONS_DIR, 'maskable-512.png'), await tile(512, 0.22))
await writeFile(join(ICONS_DIR, 'badge-72.png'), await tile(72, 0.12))

await trimTo(SOURCES.lockupBurgundy, 'zenthos-lockup-burgundy.png')
await trimTo(SOURCES.lockupWhite, 'zenthos-lockup-white.png')
await trimTo(SOURCES.markBurgundy, 'zenthos-mark-burgundy.png')
await trimTo(SOURCES.markWhite, 'zenthos-mark-white.png')

console.log('icons and logos written')
