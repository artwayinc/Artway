import type { NextConfig } from "next";

const basePath = process.env.GITHUB_ACTIONS ? '/Artway' : '';

const nextConfig: NextConfig = {
  output: "export",
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
