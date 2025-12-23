import './globals.css';
import type { Metadata } from 'next';
import { Inter, Fira_Code } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VibeCode Live - Stream Your IDE. Build in Public.',
  description: 'The premier livestreaming platform for Vibe Coders. Watch developers build with AI, collaborate in real-time, and showcase cutting-edge development workflows.',
  keywords: ['livestreaming', 'coding', 'vibe coding', 'AI development', 'developer streams', 'IDE streaming'],
  authors: [{ name: 'AINative Studio' }],
  openGraph: {
    title: 'VibeCode Live - Stream Your IDE. Build in Public.',
    description: 'Watch developers build with AI, collaborate in real-time, and showcase cutting-edge development workflows.',
    type: 'website',
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VibeCode Live - Stream Your IDE. Build in Public.',
    description: 'Watch developers build with AI, collaborate in real-time, and showcase cutting-edge development workflows.',
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${firaCode.variable} antialiased`}>{children}</body>
    </html>
  );
}
