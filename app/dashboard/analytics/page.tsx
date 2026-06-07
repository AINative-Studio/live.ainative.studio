import type { Metadata } from 'next';
import AnalyticsClient from './analytics-client';

export const metadata: Metadata = {
  title: 'Analytics',
  description: 'View detailed analytics for your AINative Studio Live streams — viewers, watch time, follower growth, and more.',
  alternates: {
    canonical: '/dashboard/analytics',
  },
  openGraph: {
    title: 'Analytics | AINative Studio Live',
    description: 'View detailed analytics for your streams.',
    url: '/dashboard/analytics',
  },
};

export default function AnalyticsPage() {
  return <AnalyticsClient />;
}
