const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const servicesDir = path.join(publicDir, 'services');

// Оптимизировать изображения из services в WebP
async function optimizeServicesImages() {
  const files = fs.readdirSync(servicesDir).filter(file => file.endsWith('.png'));
  
  console.log('Оптимизация изображений из services/...');
  
  for (const file of files) {
    const inputPath = path.join(servicesDir, file);
    const outputPath = path.join(servicesDir, file.replace('.png', '.webp'));
    
    try {
      const stats = fs.statSync(inputPath);
      const originalSize = stats.size;
      
      await sharp(inputPath)
        .webp({ quality: 85, effort: 6 })
        .toFile(outputPath);
      
      const newStats = fs.statSync(outputPath);
      const newSize = newStats.size;
      const reduction = ((1 - newSize / originalSize) * 100).toFixed(1);
      
      console.log(`✓ ${file}: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(newSize / 1024 / 1024).toFixed(2)}MB (${reduction}% меньше)`);
    } catch (error) {
      console.error(`✗ Ошибка при обработке ${file}:`, error.message);
    }
  }
}

// Оптимизировать main.png (PNG с прозрачностью)
async function optimizeMainImage() {
  const inputPath = path.join(publicDir, 'main.png');
  const outputPath = path.join(publicDir, 'main-optimized.png');
  
  if (!fs.existsSync(inputPath)) {
    console.log('main.png не найден, пропускаем...');
    return;
  }
  
  console.log('\nОптимизация main.png...');
  
  try {
    const stats = fs.statSync(inputPath);
    const originalSize = stats.size;
    
    await sharp(inputPath)
      .png({ 
        quality: 90,
        compressionLevel: 9,
        adaptiveFiltering: true
      })
      .toFile(outputPath);
    
    const newStats = fs.statSync(outputPath);
    const newSize = newStats.size;
    const reduction = ((1 - newSize / originalSize) * 100).toFixed(1);
    
    console.log(`✓ main.png: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(newSize / 1024 / 1024).toFixed(2)}MB (${reduction}% меньше)`);
    console.log('  (Создан main-optimized.png, замените оригинал вручную если нужно)');
  } catch (error) {
    console.error(`✗ Ошибка при обработке main.png:`, error.message);
  }
}

async function main() {
  console.log('Начинаем оптимизацию изображений...\n');
  
  await optimizeServicesImages();
  await optimizeMainImage();
  
  console.log('\n✓ Оптимизация завершена!');
}

main().catch(console.error);
