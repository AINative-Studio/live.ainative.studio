'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { VODPlayer } from '@/components/vod-player';
import { VODTranscriptPanel } from '@/components/vod-transcript-panel';
import type { TranscriptSegment } from '@/components/vod-transcript-panel';
import { vodService } from '@/services/vod';
import { NotFoundError } from '@/lib/api-client';
import type { VODRecording, VODChapter } from '@/types';
import {
  Eye,
  Clock,
  Share2,
  Heart,
  UserPlus,
} from 'lucide-react';

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

// Convert VODChapter array into TranscriptSegment array for the transcript panel.
// When a real transcript endpoint is available this mapping can be replaced.
function chaptersToTranscriptSegments(chapters: VODChapter[]): TranscriptSegment[] {
  return chapters.map((ch) => ({
    text: ch.description ? `${ch.title} — ${ch.description}` : ch.title,
    start: ch.startTimeSeconds,
    end: ch.endTimeSeconds,
  }));
}

export default function VODViewerPage() {
  const params = useParams();
  const vodId = params.id as string;
  const router = useRouter();

  const [vod, setVod] = useState<VODRecording | null>(null);
  const [chapters, setChapters] = useState<VODChapter[]>([]);
  const [transcriptSegments, setTranscriptSegments] = useState<TranscriptSegment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<VODChapter | null>(null);

  // Playback time shared between VODPlayer and VODTranscriptPanel
  const [currentTime, setCurrentTime] = useState(0);
  // Seek target sent down to VODPlayer when the user clicks a transcript segment
  const [seekTarget, setSeekTarget] = useState<number | undefined>(undefined);

  const [isGeneratingChapters, setIsGeneratingChapters] = useState(false);
  const [isGeneratingTranscript, setIsGeneratingTranscript] = useState(false);

  useEffect(() => {
    async function fetchVODData() {
      if (!vodId) return;

      setIsLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const [vodData, chaptersData] = await Promise.all([
          vodService.getById(vodId),
          vodService.getChapters(vodId),
        ]);

        setVod(vodData);
        setChapters(chaptersData);
        setTranscriptSegments(chaptersToTranscriptSegments(chaptersData));
      } catch (err: any) {
        console.error('Failed to fetch VOD data:', err);
        if (err instanceof NotFoundError) {
          setNotFound(true);
        } else {
          setError(err?.message || 'Failed to load VOD');
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchVODData();
  }, [vodId]);

  // Redirect to 404 when VOD is not found
  useEffect(() => {
    if (!isLoading && notFound) {
      router.replace('/not-found');
    }
  }, [isLoading, notFound, router]);

  const handleGenerateChapters = async () => {
    if (!vodId) return;
    setIsGeneratingChapters(true);
    try {
      const generated = await vodService.generateChapters(vodId);
      setChapters(generated);
      setTranscriptSegments(chaptersToTranscriptSegments(generated));
    } catch (err) {
      console.error('Failed to generate chapters:', err);
    } finally {
      setIsGeneratingChapters(false);
    }
  };

  // Transcript generate is the same endpoint — chapters serve as segments for now
  const handleGenerateTranscript = async () => {
    if (!vodId) return;
    setIsGeneratingTranscript(true);
    try {
      const generated = await vodService.generateChapters(vodId);
      setChapters(generated);
      setTranscriptSegments(chaptersToTranscriptSegments(generated));
    } catch (err) {
      console.error('Failed to generate transcript:', err);
    } finally {
      setIsGeneratingTranscript(false);
    }
  };

  const handleTranscriptSeek = (time: number) => {
    setSeekTarget(time);
    // Reset after a tick so subsequent clicks to the same timestamp still fire
    setTimeout(() => setSeekTarget(undefined), 100);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
              <div className="space-y-4">
                <Skeleton className="aspect-video w-full rounded-lg" />
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-20 w-full" />
              </div>
              <div>
                <Skeleton className="h-96 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Not found — redirect is in flight; render nothing to avoid flash
  if (notFound) {
    return null;
  }

  if (error || !vod) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">VOD Not Found</h1>
            <p className="text-muted-foreground mb-4">
              {error || 'This VOD recording does not exist or has been deleted.'}
            </p>
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
            {/* Main Content */}
            <div className="space-y-4">
              {/* Video Player with chapters */}
              <VODPlayer
                title={vod.title}
                duration={vod.duration}
                videoUrl={vod.videoUrl ?? undefined}
                thumbnailUrl={vod.thumbnailUrl ?? undefined}
                chapters={chapters}
                vodId={vodId}
                currentTime={seekTarget}
                onTimeUpdate={setCurrentTime}
                onGenerateChapters={handleGenerateChapters}
                isGeneratingChapters={isGeneratingChapters}
              />

              {/* VOD Info Card */}
              <Card className="border-border">
                <CardContent className="p-6">
                  <h1 className="text-2xl font-bold mb-2">{vod.title}</h1>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{formatViewCount(vod.viewCount)} views</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(vod.duration)}</span>
                    </div>
                    <span>•</span>
                    <span>
                      {new Date(vod.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    {vod.stream?.category && (
                      <>
                        <span>•</span>
                        <Link
                          href={`/category/${vod.stream.category.slug}`}
                          className="hover:text-brand-primary transition-colors"
                        >
                          {vod.stream.category.name}
                        </Link>
                      </>
                    )}
                  </div>

                  {vod.description && (
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {vod.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <Button variant="ghost" size="sm">
                      <Heart className="w-4 h-4 mr-2" />
                      Like
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Streamer Info Card */}
              <Card className="border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-14 h-14 border-2 border-brand-primary">
                      <AvatarImage src="/placeholder-avatar.png" alt="Streamer" />
                      <AvatarFallback>S</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">Stream Archive</h3>
                      <p className="text-sm text-muted-foreground">
                        Original Stream: {vod.stream.title}
                      </p>
                    </div>
                    <Button size="sm" className="font-mono">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Follow
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Transcript Panel */}
            <div className="lg:sticky lg:top-20 h-fit space-y-4">
              <VODTranscriptPanel
                vodId={vodId}
                segments={transcriptSegments}
                currentTime={currentTime}
                onSeek={handleTranscriptSeek}
                isGenerating={isGeneratingTranscript}
                onGenerateTranscript={
                  transcriptSegments.length === 0 ? handleGenerateTranscript : undefined
                }
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
