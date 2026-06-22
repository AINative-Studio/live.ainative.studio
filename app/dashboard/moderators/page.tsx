import type { Metadata } from 'next';
import ModeratorsClient from './moderators-client';

export const metadata: Metadata = {
  title: 'Moderators',
  description: 'Manage your stream moderators on AINative Studio Live. Add or remove chat moderators.',
  alternates: {
    canonical: '/dashboard/moderators',
  },
  openGraph: {
    title: 'Moderators | AINative Studio Live',
    description: 'Manage your stream moderators on AINative Studio Live.',
    url: '/dashboard/moderators',
    images: [{ url: "https://live.ainative.studio/og-image.png", width: 1200, height: 630 }],
  },
};

export default function ModeratorsPage() {
  return <ModeratorsClient />;
}
