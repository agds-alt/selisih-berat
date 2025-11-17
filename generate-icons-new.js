const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [192, 512];
const inputIcon = path.join(__dirname, 'public', 'icon-latest.png');
const publicDir = path.join(__dirname, 'public');

async function generateIcons() {
  try {
    if (!fs.existsSync(inputIcon)) {
      console.error('❌ Error: icon-latest.png not found in public/');
      process.exit(1);
    }

    console.log('📸 Reading icon-latest.png...');
    const iconBuffer = fs.readFileSync(inputIcon);
    const metadata = await sharp(iconBuffer).metadata();
    console.log(`✅ Source: ${metadata.width}x${metadata.height}`);

    console.log('\n🔄 Generating icons...\n');

    for (const size of sizes) {
      const outputPath = path.join(publicDir, `icon-${size}.png`);
      
      await sharp(iconBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated: icon-${size}.png`);
    }

    // Copy as main icon
    fs.copyFileSync(inputIcon, path.join(publicDir, 'icon.png'));
    console.log('✅ Copied: icon.png');

    // Generate favicon
    await sharp(iconBuffer)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(publicDir, 'favicon.png'));
    console.log('✅ Generated: favicon.png');

    console.log('\n🎉 All icons generated!');
    console.log('📱 PWA icons ready!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

generateIcons();
