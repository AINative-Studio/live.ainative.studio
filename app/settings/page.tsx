import type { Metadata } from 'next';
import SettingsClient from './settings-client';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your AINative Studio Live account settings, profile, and stream preferences.',
  alternates: {
    canonical: '/settings',
  },
  openGraph: {
    title: 'Settings | AINative Studio Live',
    description: 'Manage your account settings and stream preferences.',
    url: '/settings',
  },
};

export default function SettingsPage() {
  return <SettingsClient />;
}
