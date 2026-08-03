/**
 * Builds every icon from the supplied brand artwork. Run with `npm run icons`
 * after replacing public/zenthos-logo.png or public/zenthos-mark.png.
 *
 * The source art is burgundy line-work on an opaque white field. Painting it
 * straight onto a burgundy tile renders it invisible, so the artwork is first
 * reduced to an alpha mask (dark pixels = ink) and then re-tinted in whatever
 * colour the target needs.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'

const BRAND = { r: 128, g: 0, b: 32, alpha: 1 }
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 }

const PUBLIC_DIR = join(process.cwd(), 'public')
const ICONS_DIR = join(PUBLIC_DIR, 'icons')
const APP_DIR = join(process.cwd(), 'src', 'app')

const markSource = join(PUBLIC_DIR, 'zenthos-mark.png')
const logoSource = join(PUBLIC_DIR, 'zenthos-logo.png')

/** Crops the white field away from around the artwork. */
function trimWhite(input) {
  return sharp(input).flatten({ background: '#ffffff' }).trim({ threshold: 30 })
}

/**
 * Single-channel mask at `size`×`size`: opaque where the ink is, transparent
 * where the white field was.
 */
async function inkMask(size) {
  const trimmed = await trimWhite(markSource).toBuffer()
  const fitted = await sharp(trimmed)
    .resize(size, size, { fit: 'contain', background: '#ffffff' })
    .toBuffer()

  return (
    sharp(fitted)
      .greyscale()
      .negate()
      // Push the mid-tones from anti-aliasing to full black or white so edges
      // stay crisp at 72px rather than turning into grey haze.
      .linear(1.8, -20)
      .toColourspace('b-w')
      .toBuffer()
  )
}

/** The mark in `inkColour`, centred on `background`, padded by `padding`. */
async function renderIcon(size, padding, inkColour, background) {
  const inner = size - padding * 2
  const mask = await inkMask(inner)

  const ink = await sharp({
    create: { width: inner, height: inner, channels: 3, background: inkColour },
  })
    .joinChannel(mask)
    .png()
    .toBuffer()

  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: ink, top: padding, left: padding }])
    .png()
    .toBuffer()
}

await mkdir(ICONS_DIR, { recursive: true })
console.log('Generating brand assets…')

const trimmedLogo = await trimWhite(logoSource).png().toBuffer()
await writeFile(join(PUBLIC_DIR, 'zenthos-wordmark.png'), trimmedLogo)
console.log('  zenthos-wordmark.png')

// Favicon: burgundy mark on transparent, so it reads on light and dark tabs.
await writeFile(join(APP_DIR, 'icon.png'), await renderIcon(512, 28, BRAND, TRANSPARENT))
console.log('  src/app/icon.png (favicon)')

// Everything below is a launcher tile: white mark knocked out of burgundy.
await writeFile(join(APP_DIR, 'apple-icon.png'), await renderIcon(180, 26, '#ffffff', BRAND))
await writeFile(join(ICONS_DIR, 'icon-192.png'), await renderIcon(192, 28, '#ffffff', BRAND))
await writeFile(join(ICONS_DIR, 'icon-512.png'), await renderIcon(512, 74, '#ffffff', BRAND))
// Android launchers crop up to 20% from each edge of a maskable icon.
await writeFile(join(ICONS_DIR, 'maskable-512.png'), await renderIcon(512, 128, '#ffffff', BRAND))
await writeFile(join(ICONS_DIR, 'badge-72.png'), await renderIcon(72, 10, '#ffffff', BRAND))
console.log('  apple-icon.png, icon-192, icon-512, maskable-512, badge-72')

console.log('Done.')
