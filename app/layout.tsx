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

export const metadata: Metadata = {
  metadataBase: new URL('https://live.ainative.studio'),
  title: {
    default: 'AINative Studio Live - Developer Streaming Platform',
    template: '%s | AINative Studio Live',
  },
  description: 'The premier livestreaming platform for developers. Watch developers build in real-time, collaborate, and showcase cutting-edge development workflows.',
  keywords: ['livestreaming', 'coding', 'developer streams', 'IDE streaming', 'programming', 'live coding'],
  authors: [{ name: 'AINative Studio' }],
  icons: {
    icon: '/ainative-icon.svg',
    apple: '/ainative-icon.svg',
  },
  alternates: {
    canonical: 'https://live.ainative.studio',
  },
  openGraph: {
    title: 'AINative Studio Live - Developer Streaming Platform',
    description: 'Watch developers build in real-time, collaborate, and showcase cutting-edge development workflows.',
    type: 'website',
    url: 'https://live.ainative.studio',
    siteName: 'AINative Studio Live',
    images: [
      {
        // Dynamic OG image via /api/og — replace with a static /og-image.png (1200x630) when final brand asset is available
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'AINative Studio Live - Developer Streaming Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AINative Studio Live - Developer Streaming Platform',
    description: 'Watch developers build in real-time, collaborate, and showcase cutting-edge development workflows.',
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
        <AuthProvider>
          <StreamsProvider>
            {children}
          </StreamsProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
