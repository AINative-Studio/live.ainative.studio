import type { Metadata } from 'next';
import ResetPasswordClient from './reset-password-client';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Set a new password for your AINative Studio Live account.',
  alternates: {
    canonical: '/reset-password',
  },
  openGraph: {
    title: 'Reset Password | AINative Studio Live',
    description: 'Set a new password for your AINative Studio Live account.',
    url: '/reset-password',
  },
};

export default function ResetPasswordPage() {
  return <ResetPasswordClient />;
}
