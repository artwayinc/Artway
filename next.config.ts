import type { NextConfig } from "next";

const basePath = process.env.GITHUB_ACTIONS ? '/Artway' : '';
// Статический экспорт только для production билда (GitHub Pages)
// В режиме разработки API routes должны работать
const isStaticExport = !!process.env.GITHUB_ACTIONS || process.env.STATIC_EXPORT === 'true';

const nextConfig: NextConfig = {
  // Включаем статический экспорт только для production
  ...(isStaticExport ? { output: "export" as const } : {}),
  images: {
    unoptimized: true,
  },
  // Репозиторий называется Artway, поэтому нужен basePath
  basePath: basePath,
  // assetPrefix нужен для статических ресурсов (изображения, CSS, JS)
  assetPrefix: basePath,
  trailingSlash: true,
  // Устанавливаем переменную окружения для использования в компонентах
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
