'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { ModeratorManagement } from '@/components/moderator-management';

export default function ModeratorsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard/moderators');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  // In a real app, we would get the current user's active stream ID
  // For now, we'll use a placeholder
  const streamId = 'current-stream';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Moderators</h1>
        <p className="text-muted-foreground">
          Manage who can help moderate your stream chat
        </p>
      </div>

      <ModeratorManagement streamId={streamId} />
    </div>
  );
}
