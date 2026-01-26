import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://artwayinc.com';
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  
  const routes = [
    '',
    '/services',
    '/schedule',
    '/quote-request',
  ].map((route) => ({
    url: `${baseUrl}${basePath}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  return routes;
}
