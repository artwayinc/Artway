import type { NextConfig } from "next";

const basePath = process.env.GITHUB_ACTIONS ? "/Artway" : "";
const isStaticExport =
  !!process.env.GITHUB_ACTIONS || process.env.STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  ...(isStaticExport ? { output: "export" as const } : {}),
  images: { unoptimized: true },
  basePath: basePath,
  assetPrefix: basePath,
  trailingSlash: true,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
