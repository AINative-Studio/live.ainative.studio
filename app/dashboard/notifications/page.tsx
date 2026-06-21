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
  },
};

export default function NotificationsPage() {
  return <NotificationsClient />;
}
