import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/settings/', '/api/', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email'],
      },
      {
        userAgent: ['GPTBot', 'CCBot', 'Google-Extended'],
        allow: '/',
        disallow: ['/dashboard/', '/settings/', '/api/'],
      },
    ],
    sitemap: 'https://live.ainative.studio/sitemap.xml',
  };
}
