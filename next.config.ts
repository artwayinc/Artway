import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // Если репозиторий называется Artway, то basePath не нужен
  // Если репозиторий называется artwayinc.github.io, то basePath тоже не нужен
  // Если репозиторий называется Artway и будет доступен по адресу artwayinc.github.io/Artway, то нужен basePath: '/Artway'
  // basePath: process.env.NODE_ENV === 'production' ? '/Artway' : '',
  trailingSlash: true,
};

export default nextConfig;
