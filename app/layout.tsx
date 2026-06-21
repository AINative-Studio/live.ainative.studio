import './globals.css';
import type { Metadata } from 'next';
import { Poppins, Fira_Code } from 'next/font/google';
import { AuthProvider } from '@/contexts/auth-context';
import { StreamsProvider } from '@/contexts/streams-context';
import { Toaster } from '@/components/ui/sonner';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code',
  display: 'swap',
});

const siteDescription =
  'Watch AI-native developers stream live coding sessions, IDE workflows, multi-agent systems, and build-in-public projects in real time.';

export const metadata: Metadata = {
  metadataBase: new URL('https://live.ainative.studio'),
  title: {
    default: 'AINative Studio Live - Live Coding & AI Developer Streaming Platform',
    template: '%s | AINative Studio Live',
  },
  description: siteDescription,
  keywords: [
    'live coding',
    'developer streaming',
    'developer livestreams',
    'AI developer streams',
    'IDE streaming',
    'build in public',
    'vibe coding',
    'programming streams',
    'multi-agent workflows',
    'AI-native development',
  ],
  authors: [{ name: 'AINative Studio' }],
  icons: {
    icon: '/ainative-icon.svg',
    apple: '/ainative-icon.svg',
  },
  alternates: {
    canonical: 'https://live.ainative.studio',
  },
  openGraph: {
    title: 'AINative Studio Live - Live Coding & AI Developer Streaming Platform',
    description: siteDescription,
    type: 'website',
    url: 'https://live.ainative.studio',
    siteName: 'AINative Studio Live',
    images: [
      {
        // Dynamic OG image via /api/og — replace with a static /og-image.png (1200x630) when final brand asset is available
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'AINative Studio Live - Live Coding & AI Developer Streaming Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AINative Studio Live - Live Coding & AI Developer Streaming Platform',
    description: siteDescription,
    images: ['/api/og'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="ai-content-declaration" content="human-authored" />
        <meta name="ai-training" content="allowed" />
        <link rel="llms" type="text/plain" href="/llms.txt" />
      </head>
      <body className={`${poppins.variable} ${firaCode.variable} antialiased overflow-x-hidden`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-primary focus:text-white focus:rounded"
        >
          Skip to main content
        </a>
        <AuthProvider>
          <StreamsProvider>
            <main id="main-content">
              {children}
            </main>
          </StreamsProvider>
        </AuthProvider>
        <Toaster />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'AINative Studio Live',
              url: 'https://live.ainative.studio',
              logo: 'https://live.ainative.studio/ainative-icon.svg',
              sameAs: [
                'https://github.com/AINative-Studio',
                'https://www.ainative.studio',
              ],
              description: 'The developer streaming platform with AI-native tools for live coding',
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'AINative Studio Live',
              url: 'https://live.ainative.studio',
              description: 'Live coding and AI-native developer streaming platform for real-time collaboration and build-in-public workflows',
              publisher: {
                '@type': 'Organization',
                name: 'AINative Studio',
                url: 'https://ainative.studio',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://live.ainative.studio/api/og',
                },
              },
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://live.ainative.studio/search?q={search_term}',
                'query-input': 'required name=search_term',
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
