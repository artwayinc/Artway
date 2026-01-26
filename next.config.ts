import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // Репозиторий называется Artway, поэтому нужен basePath
  basePath: process.env.GITHUB_ACTIONS ? '/Artway' : '',
  trailingSlash: true,
};

export default nextConfig;
