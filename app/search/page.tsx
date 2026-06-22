import type { Metadata } from 'next';
import SearchClient from './search-client';

export const metadata: Metadata = {
  title: 'Search Streams',
  description: 'Search live coding streams, categories, and AI-native developers on AINative Studio Live.',
  alternates: {
    canonical: '/search',
  },
  openGraph: {
    title: 'Search Streams | AINative Studio Live',
    description: 'Find live coding streams, categories, and AI-native developers.',
    url: '/search',
    images: [{ url: "https://live.ainative.studio/og-image.png", width: 1200, height: 630 }],
  },
};

export default function SearchPage() {
  return <SearchClient />;
}
