#!/usr/bin/env node
/**
 * Generate PWA icons from SVG
 * Run with: node scripts/generate-icons.js
 *
 * Note: This script requires 'sharp' to be installed.
 * Run: npm install -D sharp (or pnpm add -D sharp)
 */

const fs = require('fs');
const path = require('path');

async function generateIcons() {
  try {
    // Try to import sharp
    const sharp = require('sharp');

    const svgPath = path.join(__dirname, '../public/icon.svg');
    const publicDir = path.join(__dirname, '../public');

    console.log('📸 Generating PWA icons...\n');

    // Read SVG file
    const svgBuffer = fs.readFileSync(svgPath);

    // Generate 192x192 icon
    console.log('Generating icon-192.png...');
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile(path.join(publicDir, 'icon-192.png'));
    console.log('✅ icon-192.png created');

    // Generate 512x512 icon
    console.log('Generating icon-512.png...');
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(path.join(publicDir, 'icon-512.png'));
    console.log('✅ icon-512.png created');

    console.log('\n✨ All icons generated successfully!');
    console.log('📁 Icons saved to: public/');

  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('\n❌ Error: sharp is not installed');
      console.error('\n📦 Please install sharp first:');
      console.error('   npm install -D sharp');
      console.error('   or');
      console.error('   pnpm add -D sharp');
      console.error('\n💡 Alternative: Open scripts/generate-icons.html in your browser');
      process.exit(1);
    } else {
      console.error('❌ Error generating icons:', error.message);
      process.exit(1);
    }
  }
}

generateIcons();
