const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const LOGO_PATH = path.join(__dirname, '../public/curio_logo.png');
const PUBLIC_DIR = path.join(__dirname, '../public');

// Define favicon sizes to generate
const SIZES = [16, 32, 48, 64, 72, 96, 120, 128, 144, 152, 180, 192, 384, 512];

async function generateFavicons() {
  console.log('Generating favicons from:', LOGO_PATH);

  try {
    // Check if logo exists
    if (!fs.existsSync(LOGO_PATH)) {
      console.error('Logo file not found:', LOGO_PATH);
      return;
    }

    // Create favicon.ico (16x16, 32x32 multi-size ICO)
    await sharp(LOGO_PATH)
      .resize(32, 32)
      .toFile(path.join(PUBLIC_DIR, 'favicon.ico'));
    
    console.log('✓ Created favicon.ico');

    // Create apple-icon.png
    await sharp(LOGO_PATH)
      .resize(180, 180)
      .toFile(path.join(PUBLIC_DIR, 'apple-icon.png'));
    
    console.log('✓ Created apple-icon.png');

    // Create various sizes for different devices
    for (const size of SIZES) {
      await sharp(LOGO_PATH)
        .resize(size, size)
        .toFile(path.join(PUBLIC_DIR, `favicon-${size}x${size}.png`));
      
      console.log(`✓ Created favicon-${size}x${size}.png`);
    }

    console.log('All favicons generated successfully!');
  } catch (error) {
    console.error('Error generating favicons:', error);
  }
}

generateFavicons(); 