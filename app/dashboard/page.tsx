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
  },
};

export default function DashboardPage() {
  return <DashboardClient />;
}
