import type { Metadata } from 'next';
import ForgotPasswordClient from './forgot-password-client';

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Reset your AINative Studio Live password. Enter your email to receive a password reset link.',
  alternates: {
    canonical: '/forgot-password',
  },
  openGraph: {
    title: 'Forgot Password | AINative Studio Live',
    description: 'Reset your AINative Studio Live password.',
    url: '/forgot-password',
    images: [{ url: "https://live.ainative.studio/og-image.png", width: 1200, height: 630 }],
  },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
