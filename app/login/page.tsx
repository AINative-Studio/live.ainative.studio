import type { Metadata } from 'next';
import LoginClient from './login-client';

export const metadata: Metadata = {
  title: 'Log In',
  description: 'Sign in to your AINative Studio Live account to start streaming or watching live developer sessions.',
  alternates: {
    canonical: '/login',
  },
  openGraph: {
    title: 'Log In | AINative Studio Live',
    description: 'Sign in to your AINative Studio Live account.',
    url: '/login',
    images: [{ url: "https://live.ainative.studio/og-image.png", width: 1200, height: 630 }],
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
