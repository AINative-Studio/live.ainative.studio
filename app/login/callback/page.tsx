'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import apiClient from '@/lib/api-client';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const provider = state?.split(':')[0] || 'github';

    if (!code) {
      setError('No authorization code received. Please try again.');
      return;
    }

    async function handleCallback() {
      try {
        const endpoint = provider === 'google'
          ? '/auth/google/callback'
          : '/auth/github/callback';

        const response: any = await apiClient.post(endpoint, {
          code,
          redirect_uri: `${window.location.origin}/login/callback`,
        }, false);

        // Store tokens
        if (response.access_token) {
          localStorage.setItem('ainative_access_token', response.access_token);
          if (response.refresh_token) {
            localStorage.setItem('ainative_refresh_token', response.refresh_token);
          }
          // Set cookie for middleware
          document.cookie = `ainative_access_token=${response.access_token}; path=/; max-age=86400; SameSite=Lax`;
        }

        // Redirect to dashboard
        router.replace('/dashboard');
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
      }
    }

    handleCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-destructive font-medium">{error}</p>
          <a href="/login" className="text-brand-primary hover:underline">
            Back to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
