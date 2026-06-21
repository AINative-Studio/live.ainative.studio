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
  },
};

export default function ModeratorsPage() {
  return <ModeratorsClient />;
}
