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
    images: [{ url: "https://live.ainative.studio/og-image.png", width: 1200, height: 630 }],
  },
};

export default function AnalyticsPage() {
  return <AnalyticsClient />;
}
