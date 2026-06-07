/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.ainative.studio',
      },
      {
        protocol: 'https',
        hostname: '*.cloudflare.com',
      },
      {
        protocol: 'https',
        hostname: 'cloudflare.com',
      },
    ],
  },
  async redirects() {
    return [
      { source: '/signup', destination: '/register', permanent: true },
      { source: '/go-live', destination: '/dashboard/go-live', permanent: true },
      { source: '/pricing', destination: '/upgrade', permanent: true },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://api.ainative.studio/v1'}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
