import type { Metadata } from 'next';
import NotificationsClient from './notifications-client';

export const metadata: Metadata = {
  title: 'Notifications',
  description: 'View your follow notifications and live stream alerts on AINative Studio Live.',
  alternates: {
    canonical: '/dashboard/notifications',
  },
  openGraph: {
    title: 'Notifications | AINative Studio Live',
    description: 'View your follow notifications and live stream alerts.',
    url: '/dashboard/notifications',
    images: [{ url: "https://live.ainative.studio/og-image.png", width: 1200, height: 630 }],
  },
};

export default function NotificationsPage() {
  return <NotificationsClient />;
}
