const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_FILE = './public/icon-latestv1.jpeg';

const icons = [
  // PWA icons
  { size: 192, output: 'public/icon-192.png' },
  { size: 512, output: 'public/icon-512.png' },

  // Favicon
  { size: 32, output: 'public/favicon.png' },

  // App favicon
  { size: 32, output: 'app/icon.png' },

  // Apple touch icon
  { size: 180, output: 'public/apple-touch-icon.png' },

  // Display icon for login/signup
  { size: 512, output: 'public/icon-latest.png' }
];

async function generateAllIcons() {
  try {
    console.log('📸 Reading source icon: icon-latestv1.jpeg');
    const iconBuffer = await fs.promises.readFile(INPUT_FILE);

    for (const { size, output } of icons) {
      console.log(`🎨 Generating ${output} (${size}x${size})...`);

      await sharp(iconBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toFile(output);

      const stats = await fs.promises.stat(output);
      console.log(`✅ Created ${output} (${(stats.size / 1024).toFixed(1)}KB)`);
    }

    console.log('\n🎉 All icons generated successfully from icon-latestv1.jpeg!');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generateAllIcons();
