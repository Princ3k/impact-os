import sharp from 'sharp'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

// Read the SVG file
const svgBuffer = readFileSync(join(projectRoot, 'public', 'icon.svg'))

async function generateIcons() {
  console.log('Generating icon files...')

  // Generate 32x32 icons (light and dark)
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(join(projectRoot, 'public', 'icon-light-32x32.png'))
  console.log('✓ Generated icon-light-32x32.png')

  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(join(projectRoot, 'public', 'icon-dark-32x32.png'))
  console.log('✓ Generated icon-dark-32x32.png')

  // Generate 180x180 Apple icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(join(projectRoot, 'public', 'apple-icon.png'))
  console.log('✓ Generated apple-icon.png')

  // Generate additional sizes for better quality
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(join(projectRoot, 'public', 'icon-192x192.png'))
  console.log('✓ Generated icon-192x192.png')

  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(join(projectRoot, 'public', 'icon-512x512.png'))
  console.log('✓ Generated icon-512x512.png')

  console.log('\n✓ All icons generated successfully!')
}

generateIcons().catch(console.error)
