import './globals.css';
import type { Metadata } from 'next';
import { Poppins, Fira_Code } from 'next/font/google';
import { AuthProvider } from '@/contexts/auth-context';
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
  title: 'AINative Studio Live - Developer Streaming Platform',
  description: 'The premier livestreaming platform for developers. Watch developers build in real-time, collaborate, and showcase cutting-edge development workflows.',
  keywords: ['livestreaming', 'coding', 'developer streams', 'IDE streaming', 'programming', 'live coding'],
  authors: [{ name: 'AINative Studio' }],
  icons: {
    icon: '/ainative-icon.svg',
    apple: '/ainative-icon.svg',
  },
  openGraph: {
    title: 'AINative Studio Live - Developer Streaming Platform',
    description: 'Watch developers build in real-time, collaborate, and showcase cutting-edge development workflows.',
    type: 'website',
    url: 'https://live.ainative.studio',
    siteName: 'AINative Studio Live',
    images: [
      {
        url: '/ainative-icon.svg',
        width: 100,
        height: 85,
        alt: 'AINative Studio Live Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AINative Studio Live - Developer Streaming Platform',
    description: 'Watch developers build in real-time, collaborate, and showcase cutting-edge development workflows.',
    images: ['/ainative-icon.svg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${poppins.variable} ${firaCode.variable} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
