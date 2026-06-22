import type { Metadata } from 'next';
import GoLiveClient from './go-live-client';

export const metadata: Metadata = {
  title: 'Go Live',
  description: 'Start your live coding stream on AINative Studio Live. Configure your stream settings and go live in seconds.',
  alternates: {
    canonical: '/dashboard/go-live',
  },
  openGraph: {
    title: 'Go Live | AINative Studio Live',
    description: 'Start your live coding stream and share your AI-native workflow.',
    url: '/dashboard/go-live',
    images: [{ url: "https://live.ainative.studio/og-image.png", width: 1200, height: 630 }],
  },
};

export default function GoLivePage() {
  return <GoLiveClient />;
}
