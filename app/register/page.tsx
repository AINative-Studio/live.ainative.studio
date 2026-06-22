import type { Metadata } from 'next';
import RegisterClient from './register-client';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create your AINative Studio Live account and start sharing your AI-native development workflow with the world.',
  alternates: {
    canonical: '/register',
  },
  openGraph: {
    title: 'Sign Up | AINative Studio Live',
    description: 'Create your AINative Studio Live account and start sharing your AI-native development workflow.',
    url: '/register',
    images: [{ url: "https://live.ainative.studio/og-image.png", width: 1200, height: 630 }],
  },
};

export default function RegisterPage() {
  return <RegisterClient />;
}
