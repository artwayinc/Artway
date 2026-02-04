const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const publicDir = path.join(__dirname, "..", "public");
const servicesDir = path.join(publicDir, "services");

// Оптимизировать изображения из services в WebP
async function optimizeServicesImages() {
  const files = fs
    .readdirSync(servicesDir)
    .filter((file) => file.endsWith(".png"));

  console.log("Оптимизация изображений из services/...");

  for (const file of files) {
    const inputPath = path.join(servicesDir, file);
    const outputPath = path.join(servicesDir, file.replace(".png", ".webp"));

    try {
      const stats = fs.statSync(inputPath);
      const originalSize = stats.size;

      await sharp(inputPath)
        .webp({ quality: 85, effort: 6 })
        .toFile(outputPath);

      const newStats = fs.statSync(outputPath);
      const newSize = newStats.size;
      const reduction = ((1 - newSize / originalSize) * 100).toFixed(1);

      console.log(
        `✓ ${file}: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(
          newSize /
          1024 /
          1024
        ).toFixed(2)}MB (${reduction}% меньше)`
      );
    } catch (error) {
      console.error(`✗ Ошибка при обработке ${file}:`, error.message);
    }
  }
}

// Конвертировать главное изображение (main.jpg) в WebP, как в services
async function optimizeMainImage() {
  const inputPath = path.join(publicDir, "main.jpg");
  const outputPath = path.join(publicDir, "main.webp");

  if (!fs.existsSync(inputPath)) {
    console.log("main.jpg не найден, пропускаем...");
    return;
  }

  console.log("\nКонвертация main.jpg → main.webp...");

  try {
    const stats = fs.statSync(inputPath);
    const originalSize = stats.size;

    await sharp(inputPath).webp({ quality: 85, effort: 6 }).toFile(outputPath);

    const newStats = fs.statSync(outputPath);
    const newSize = newStats.size;
    const reduction = ((1 - newSize / originalSize) * 100).toFixed(1);

    console.log(
      `✓ main.jpg: ${(originalSize / 1024 / 1024).toFixed(2)}MB → main.webp ${(
        newSize /
        1024 /
        1024
      ).toFixed(2)}MB (${reduction}% меньше)`
    );
  } catch (error) {
    console.error(`✗ Ошибка при обработке main.jpg:`, error.message);
  }
}

async function main() {
  console.log("Начинаем оптимизацию изображений...\n");

  await optimizeServicesImages();
  await optimizeMainImage();

  console.log("\n✓ Оптимизация завершена!");
}

main().catch(console.error);
