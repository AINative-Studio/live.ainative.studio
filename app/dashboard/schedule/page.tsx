import type { Metadata } from 'next';
import ScheduleClient from './schedule-client';

export const metadata: Metadata = {
  title: 'Schedule',
  description: 'Manage your streaming schedule on AINative Studio Live. Set recurring stream times and let viewers know when you go live.',
  alternates: {
    canonical: '/dashboard/schedule',
  },
  openGraph: {
    title: 'Schedule | AINative Studio Live',
    description: 'Manage your streaming schedule on AINative Studio Live.',
    url: '/dashboard/schedule',
    images: [{ url: "https://live.ainative.studio/og-image.png", width: 1200, height: 630 }],
  },
};

export default function SchedulePage() {
  return <ScheduleClient />;
}
