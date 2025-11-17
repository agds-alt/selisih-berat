const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_FILE = './public/icon-aplikasi-pwa.jpeg';
const PUBLIC_DIR = './public';

const sizes = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' }
];

async function generateIcons() {
  try {
    console.log('📸 Reading source icon...');
    const iconBuffer = await fs.promises.readFile(INPUT_FILE);

    for (const { size, name } of sizes) {
      const outputPath = path.join(PUBLIC_DIR, name);

      console.log(`🎨 Generating ${name} (${size}x${size})...`);

      await sharp(iconBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);

      const stats = await fs.promises.stat(outputPath);
      console.log(`✅ Created ${name} (${(stats.size / 1024).toFixed(1)}KB)`);
    }

    console.log('\n🎉 All PWA icons generated successfully!');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
