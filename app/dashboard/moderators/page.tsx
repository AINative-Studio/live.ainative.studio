'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { ModeratorManagement } from '@/components/moderator-management';
import { AiModerationCard } from '@/components/ai-moderation-card';
import { streamsService } from '@/services/streams';

export default function ModeratorsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [streamId, setStreamId] = useState<string | null>(null);
  const [streamLoading, setStreamLoading] = useState(true);
  const [streamError, setStreamError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard/moderators');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    async function fetchActiveStream() {
      setStreamLoading(true);
      setStreamError(null);
      try {
        const stream = await streamsService.getActiveStream();
        if (cancelled) return;
        if (stream) {
          setStreamId(stream.id);
        } else {
          setStreamId(null);
        }
      } catch (err) {
        if (cancelled) return;
        setStreamError('Failed to load your active stream. Please try again.');
      } finally {
        if (!cancelled) {
          setStreamLoading(false);
        }
      }
    }

    fetchActiveStream();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Moderators</h1>
        <p className="text-muted-foreground">
          Manage who can help moderate your stream chat
        </p>
      </div>

      {streamLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <span className="ml-3 text-muted-foreground">Loading stream...</span>
        </div>
      )}

      {streamError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive">{streamError}</p>
          <button
            onClick={() => {
              setStreamLoading(true);
              setStreamError(null);
              streamsService.getActiveStream()
                .then(stream => {
                  setStreamId(stream ? stream.id : null);
                })
                .catch(() => {
                  setStreamError('Failed to load your active stream. Please try again.');
                })
                .finally(() => setStreamLoading(false));
            }}
            className="mt-4 text-sm text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {!streamLoading && !streamError && !streamId && (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No active stream</h2>
          <p className="text-muted-foreground mb-4">
            Create a stream first to manage moderators.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Go to Dashboard
          </button>
        </div>
      )}

      {!streamLoading && !streamError && streamId && (
        <>
          <AiModerationCard />
          <div className="mt-8">
            <ModeratorManagement streamId={streamId} />
          </div>
        </>
      )}
    </div>
  );
}
