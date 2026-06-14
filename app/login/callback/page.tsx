'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { setAuthToken, setRefreshToken, setCurrentUser } from '@/lib/auth';
import type { User } from '@/types';

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

        // apiClient.handleResponse() transforms snake_case keys to camelCase,
        // so access_token becomes accessToken. Check both for safety.
        const token = response.accessToken || response.access_token;
        const refresh = response.refreshToken || response.refresh_token;

        if (!token) {
          setError('No access token received. Please try again.');
          return;
        }

        // Store tokens using the shared auth helpers (sets localStorage + cookie)
        setAuthToken(token);
        if (refresh) {
          setRefreshToken(refresh);
        }

        // Fetch and store user profile so auth context picks it up
        try {
          const user: User = await apiClient.get('/auth/me', true);
          setCurrentUser(user);
        } catch {
          // Non-fatal — user can be fetched later
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
