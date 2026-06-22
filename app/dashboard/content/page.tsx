import type { Metadata } from 'next';
import ContentDashboardClient from './content-dashboard-client';

export const metadata: Metadata = {
  title: 'Content Pipeline',
  description:
    'Manage auto-generated content from your streams — blog drafts, code snippets, transcripts, and chapters.',
  alternates: {
    canonical: '/dashboard/content',
  },
  openGraph: {
    title: 'Content Pipeline | AINative Studio Live',
    description:
      'Turn your streams into blog posts, code snippets, and searchable transcripts.',
    url: '/dashboard/content',
    images: [{ url: "https://live.ainative.studio/og-image.png", width: 1200, height: 630 }],
  },
};

export default function ContentDashboardPage() {
  return <ContentDashboardClient />;
}
