'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ClipCard } from '@/components/clip-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Scissors } from 'lucide-react';
import { clipsService } from '@/services/clips';
import type { Clip } from '@/types';

export default function ClipsPage() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClips() {
      setIsLoading(true);
      setError(null);

      try {
        const popularClips = await clipsService.getPopular(24);
        setClips(popularClips);
      } catch (err: any) {
        console.error('Failed to fetch clips:', err);
        setError(err?.message || 'Failed to load clips');
        setClips([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchClips();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-brand-primary/20 rounded-lg flex items-center justify-center">
              <Scissors className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Clips</h1>
              <p className="text-muted-foreground">
                Popular clips from across the platform
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-video w-full rounded-lg" />
                  <div className="flex gap-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Scissors className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Could not load clips</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Try Again
              </Button>
            </div>
          ) : clips.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Scissors className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No clips yet</h2>
              <p className="text-muted-foreground">
                Be the first to create a clip! Watch a stream and click the clip button to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {clips.map((clip, index) => (
                <ClipCard key={clip.id} clip={clip} priority={index < 4} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
