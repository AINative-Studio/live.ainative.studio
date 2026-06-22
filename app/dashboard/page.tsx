import type { Metadata } from 'next';
import DashboardClient from './dashboard-client';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Manage your streams, view analytics, and control your AINative Studio Live channel.',
  alternates: {
    canonical: '/dashboard',
  },
  openGraph: {
    title: 'Dashboard | AINative Studio Live',
    description: 'Manage your streams, view analytics, and control your channel.',
    url: '/dashboard',
    images: [{ url: "https://live.ainative.studio/og-image.png", width: 1200, height: 630 }],
  },
};

export default function DashboardPage() {
  return <DashboardClient />;
}
