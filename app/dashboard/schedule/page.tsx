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
  },
};

export default function SchedulePage() {
  return <ScheduleClient />;
}
