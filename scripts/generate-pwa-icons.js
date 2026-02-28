/**
 * Generate PWA icons from the source logo.
 * Run: node scripts/generate-pwa-icons.js
 */
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const SOURCE = path.resolve(__dirname, '../public/logo/citronics2.png')
const OUT_DIR = path.resolve(__dirname, '../public/images/icons/pwa')

const SIZES = [16, 32, 48, 72, 96, 128, 144, 152, 180, 192, 256, 384, 512]

async function main() {
  // Ensure output directory exists
  fs.mkdirSync(OUT_DIR, { recursive: true })

  for (const size of SIZES) {
    const filename = size === 180 ? 'apple-touch-icon.png' : `icon-${size}x${size}.png`
    await sharp(SOURCE)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(path.join(OUT_DIR, filename))
    console.log(`  ✓ ${filename}`)
  }

  // Also generate a maskable version (with padding for safe zone)
  // Maskable icons need ~10% padding on each side
  const maskableDir = OUT_DIR
  for (const size of [192, 512]) {
    const innerSize = Math.round(size * 0.8) // 80% of total, leaving 10% padding on each side
    const canvas = sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 124, g: 58, b: 237, alpha: 1 } // #7C3AED theme color
      }
    })

    const resizedLogo = await sharp(SOURCE)
      .resize(innerSize, innerSize, { fit: 'contain', background: { r: 124, g: 58, b: 237, alpha: 1 } })
      .png()
      .toBuffer()

    await canvas
      .composite([{ input: resizedLogo, gravity: 'centre' }])
      .png()
      .toFile(path.join(maskableDir, `icon-${size}x${size}-maskable.png`))
    console.log(`  ✓ icon-${size}x${size}-maskable.png`)
  }

  console.log('\n✅ All PWA icons generated!')
}

main().catch(err => {
  console.error('Failed to generate icons:', err)
  process.exit(1)
})
