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
  },
};

export default function RegisterPage() {
  return <RegisterClient />;
}
