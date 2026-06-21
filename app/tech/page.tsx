import type { Metadata } from 'next';
import TechBrowseClient from './tech-browse-client';

export const metadata: Metadata = {
  title: 'Browse by Tech Stack',
  description: 'Find live developer streams by programming language or framework. Browse TypeScript, Python, Rust, React, and more on AINative Studio Live.',
  alternates: {
    canonical: '/tech',
  },
  openGraph: {
    title: 'Browse by Tech Stack | AINative Studio Live',
    description: 'Find live developer streams by programming language or framework.',
    url: '/tech',
  },
};

export default function TechBrowsePage() {
  return <TechBrowseClient />;
}
