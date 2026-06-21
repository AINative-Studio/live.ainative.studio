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
import { contentPipelineService } from '@/services/content-pipeline';
import { NotFoundError } from '@/lib/api-client';
import type { VODRecording, VODChapter } from '@/types';
import {
  Eye,
  Clock,
  Share2,
  Heart,
  UserPlus,
  Scissors,
  FileText,
  Download,
  Sparkles,
  Captions,
  CaptionsOff,
  Loader2,
} from 'lucide-react';
import { CreateClipDialog } from '@/components/create-clip-dialog';

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
  const [isGeneratingBlog, setIsGeneratingBlog] = useState(false);
  const [blogGenerated, setBlogGenerated] = useState(false);
  const [isClipDialogOpen, setIsClipDialogOpen] = useState(false);

  // Captions state
  const [captions, setCaptions] = useState<{ startTime: number; endTime: number; text: string }[]>([]);
  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState(false);
  const [captionsVisible, setCaptionsVisible] = useState(true);
  const [captionsError, setCaptionsError] = useState<string | null>(null);

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

  const handleGenerateBlogDraft = async () => {
    if (!vod) return;
    setIsGeneratingBlog(true);
    try {
      await contentPipelineService.generateBlogDraft(vod.streamId);
      setBlogGenerated(true);
    } catch (err) {
      console.error('Failed to generate blog draft:', err);
    } finally {
      setIsGeneratingBlog(false);
    }
  };

  const handleExportContent = async (format: 'markdown' | 'html') => {
    if (!vod) return;
    try {
      const data = await contentPipelineService.exportContent(vod.streamId, format);
      const blob = new Blob([data], {
        type: format === 'html' ? 'text/html' : 'text/markdown',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${vod.title.replace(/\s+/g, '-').toLowerCase()}.${format === 'html' ? 'html' : 'md'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export content:', err);
    }
  };

  const handleGenerateCaptions = async () => {
    if (!vodId) return;
    setIsGeneratingCaptions(true);
    setCaptionsError(null);
    try {
      const res = await fetch('/api/ai/captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vodId,
          videoUrl: vod?.videoUrl || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || 'Failed to generate captions');
      }

      const data = await res.json();
      setCaptions(data.captions || []);
      setCaptionsVisible(true);
    } catch (err: any) {
      console.error('Failed to generate captions:', err);
      setCaptionsError(err?.message || 'Failed to generate captions');
    } finally {
      setIsGeneratingCaptions(false);
    }
  };

  // Get the current caption based on playback time
  const activeCaption = captions.find(
    (c) => currentTime >= c.startTime && currentTime < c.endTime
  );

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

  const videoObjectJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: vod.title,
    description: vod.description || `Watch ${vod.title} on AINative Studio Live`,
    thumbnailUrl: vod.thumbnailUrl || 'https://live.ainative.studio/placeholder-stream.jpg',
    uploadDate: vod.createdAt,
    ...(vod.duration ? { duration: `PT${Math.floor(vod.duration / 60)}M${vod.duration % 60}S` } : {}),
    contentUrl: `https://live.ainative.studio/vod/${vod.id}`,
    embedUrl: `https://live.ainative.studio/vod/${vod.id}`,
    publisher: {
      '@type': 'Organization',
      name: 'AINative Studio Live',
      logo: {
        '@type': 'ImageObject',
        url: 'https://live.ainative.studio/ainative-icon.svg',
      },
    },
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoObjectJsonLd) }}
      />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
            {/* Main Content */}
            <div className="space-y-4">
              {/* Video Player with chapters */}
              <div className="relative">
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

                {/* Caption overlay */}
                {captionsVisible && activeCaption && (
                  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 max-w-[80%] pointer-events-none z-10">
                    <div className="bg-black/80 text-white text-sm md:text-base px-4 py-2 rounded-md text-center leading-relaxed">
                      {activeCaption.text}
                    </div>
                  </div>
                )}
              </div>

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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsClipDialogOpen(true)}
                    >
                      <Scissors className="w-4 h-4 mr-2" />
                      Clip
                    </Button>
                    {captions.length === 0 ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleGenerateCaptions}
                        disabled={isGeneratingCaptions}
                      >
                        {isGeneratingCaptions ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Captions className="w-4 h-4 mr-2" />
                        )}
                        {isGeneratingCaptions ? 'Generating...' : 'Generate Captions'}
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCaptionsVisible(!captionsVisible)}
                      >
                        {captionsVisible ? (
                          <CaptionsOff className="w-4 h-4 mr-2" />
                        ) : (
                          <Captions className="w-4 h-4 mr-2" />
                        )}
                        {captionsVisible ? 'Hide Captions' : 'Show Captions'}
                      </Button>
                    )}
                    <div className="ml-auto flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateBlogDraft}
                        disabled={isGeneratingBlog || blogGenerated}
                      >
                        {isGeneratingBlog ? (
                          <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                        ) : (
                          <FileText className="w-4 h-4 mr-2" />
                        )}
                        {blogGenerated
                          ? 'Blog Generated'
                          : isGeneratingBlog
                            ? 'Generating...'
                            : 'Generate Blog Post'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportContent('markdown')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Captions error */}
              {captionsError && (
                <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-md px-4 py-2">
                  {captionsError}
                </div>
              )}

              {/* Captions sidebar panel (when generated) */}
              {captions.length > 0 && (
                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Captions className="w-4 h-4" />
                      Captions ({captions.length} segments)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="max-h-48 overflow-y-auto space-y-1">
                    {captions.map((caption, idx) => (
                      <button
                        key={idx}
                        className={`w-full text-left text-xs px-2 py-1.5 rounded transition-colors ${
                          activeCaption === caption
                            ? 'bg-brand-primary/20 text-brand-primary'
                            : 'text-muted-foreground hover:bg-card hover:text-foreground'
                        }`}
                        onClick={() => handleTranscriptSeek(caption.startTime)}
                      >
                        <span className="font-mono text-[10px] mr-2">
                          {formatDuration(caption.startTime)}
                        </span>
                        {caption.text}
                      </button>
                    ))}
                  </CardContent>
                </Card>
              )}

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

      <CreateClipDialog
        open={isClipDialogOpen}
        onOpenChange={setIsClipDialogOpen}
        streamId={vod.streamId}
        streamTitle={vod.title}
        totalDuration={vod.duration}
        isLive={false}
      />
    </div>
  );
}
