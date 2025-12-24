'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { vodService } from '@/services/vod';
import type { VODRecording, VODChapter } from '@/types';
import {
  Play,
  Eye,
  Clock,
  Share2,
  Heart,
  UserPlus,
  PlayCircle,
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

export default function VODViewerPage() {
  const params = useParams();
  const vodId = params.id as string;

  const [vod, setVod] = useState<VODRecording | null>(null);
  const [chapters, setChapters] = useState<VODChapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<VODChapter | null>(null);

  useEffect(() => {
    async function fetchVODData() {
      if (!vodId) return;

      setIsLoading(true);
      setError(null);

      try {
        const [vodData, chaptersData] = await Promise.all([
          vodService.getById(vodId),
          vodService.getChapters(vodId),
        ]);

        setVod(vodData);
        setChapters(chaptersData);
      } catch (err: any) {
        console.error('Failed to fetch VOD data:', err);
        setError(err?.message || 'Failed to load VOD');
      } finally {
        setIsLoading(false);
      }
    }

    fetchVODData();
  }, [vodId]);

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
              {/* Video Player Placeholder */}
              <Card className="overflow-hidden border-border bg-black">
                <div className="relative aspect-video bg-gradient-to-br from-brand-primary/20 to-secondary/20">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Play className="w-20 h-20 text-white/80 mx-auto mb-4" />
                      <p className="text-brand-primary font-mono text-xl mb-2">
                        VOD PLAYER
                      </p>
                      <p className="text-white/60 text-sm">
                        Video playback would be integrated here
                      </p>
                    </div>
                  </div>

                  {/* VOD Badge */}
                  <div className="absolute top-4 left-4">
                    <div className="bg-brand-primary text-white px-3 py-1 rounded text-xs font-medium">
                      VOD
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-black/80 text-white px-3 py-1 rounded text-xs font-mono">
                      {formatDuration(vod.duration)}
                    </div>
                  </div>
                </div>
              </Card>

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

            {/* Sidebar - Chapters */}
            <div className="lg:sticky lg:top-20 h-fit">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    Chapters ({chapters.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {chapters.length > 0 ? (
                    <div className="max-h-[600px] overflow-y-auto">
                      {chapters.map((chapter, index) => (
                        <button
                          key={chapter.id}
                          onClick={() => setSelectedChapter(chapter)}
                          className={`w-full text-left p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors ${
                            selectedChapter?.id === chapter.id
                              ? 'bg-muted/50'
                              : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1 shrink-0">
                              <PlayCircle className="w-5 h-5 text-brand-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm mb-1 truncate">
                                {index + 1}. {chapter.title}
                              </h4>
                              {chapter.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                  {chapter.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="font-mono">
                                  {formatDuration(chapter.startTimeSeconds)}
                                </span>
                                {chapter.isAiGenerated && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs h-5 px-1.5"
                                  >
                                    AI
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <PlayCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No chapters available</p>
                      <p className="text-xs mt-1">
                        Chapters help you navigate through the recording
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
