import { MetadataRoute } from 'next';

const BASE = 'https://live.ainative.studio';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  return [
    { url: BASE, lastModified: now, changeFrequency: 'hourly', priority: 1 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/vibe-coding`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/search`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
