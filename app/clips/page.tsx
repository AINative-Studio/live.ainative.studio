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
  },
};

export default function ClipsPage() {
  return <ClipsClient />;
}
