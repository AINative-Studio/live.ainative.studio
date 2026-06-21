import type { Metadata } from 'next';
import VerifyEmailClient from './verify-email-client';

export const metadata: Metadata = {
  title: 'Verify Email',
  description: 'Verify your email address to activate your AINative Studio Live account.',
  alternates: {
    canonical: '/verify-email',
  },
  openGraph: {
    title: 'Verify Email | AINative Studio Live',
    description: 'Verify your email address to activate your AINative Studio Live account.',
    url: '/verify-email',
  },
};

export default function VerifyEmailPage() {
  return <VerifyEmailClient />;
}
