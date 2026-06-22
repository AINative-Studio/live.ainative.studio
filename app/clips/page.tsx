import type { Metadata } from 'next';
import ClipsClient from './clips-client';

export const metadata: Metadata = {
  title: 'Popular Clips',
  description: 'Watch the most popular clips from live developer streams on AINative Studio Live.',
  alternates: {
    canonical: '/clips',
  },
  openGraph: {
    title: 'Popular Clips | AINative Studio Live',
    description: 'Watch the most popular clips from live developer streams on AINative Studio Live.',
    url: '/clips',
    images: [{ url: "https://live.ainative.studio/og-image.png", width: 1200, height: 630 }],
  },
};

export default function ClipsPage() {
  return <ClipsClient />;
}
