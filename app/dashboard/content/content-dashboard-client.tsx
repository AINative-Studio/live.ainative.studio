'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { dashboardService } from '@/services/dashboard';
import { contentPipelineService } from '@/services/content-pipeline';
import type { Stream, StreamContent } from '@/types';
import {
  FileText,
  Code2,
  BookOpen,
  Download,
  Sparkles,
  ChevronRight,
  Clock,
  Video,
  AlertCircle,
} from 'lucide-react';

type ContentStatus = 'generated' | 'pending' | 'not_available';

interface StreamWithContent {
  stream: Stream;
  content: StreamContent | null;
  status: ContentStatus;
}

function getContentStatus(content: StreamContent | null): ContentStatus {
  if (!content) return 'not_available';
  if (content.generatedAt) return 'generated';
  return 'pending';
}

function StatusBadge({ status }: { status: ContentStatus }) {
  switch (status) {
    case 'generated':
      return (
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
          Generated
        </Badge>
      );
    case 'pending':
      return (
        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
          Pending
        </Badge>
      );
    case 'not_available':
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Not Available
        </Badge>
      );
  }
}

function ContentRowSkeleton() {
  return (
    <Card className="border-border">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-5 w-5 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ContentDashboardClient() {
  const { user, isAuthenticated } = useAuth();
  const [streams, setStreams] = useState<StreamWithContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingFor, setGeneratingFor] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchData() {
      if (!isAuthenticated) return;
      setIsLoading(true);
      setError(null);

      try {
        const overview = await dashboardService.getOverview();
        const recentStreams = overview.recentStreams || [];

        // Attempt to fetch content status for each stream
        const withContent: StreamWithContent[] = await Promise.all(
          recentStreams.map(async (stream) => {
            try {
              const content = await contentPipelineService.getStreamContent(
                stream.id
              );
              return {
                stream,
                content,
                status: getContentStatus(content),
              };
            } catch {
              return {
                stream,
                content: null,
                status: 'not_available' as ContentStatus,
              };
            }
          })
        );

        setStreams(withContent);
      } catch (err: any) {
        console.error('Failed to load content pipeline data:', err);
        setError(err?.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [isAuthenticated]);

  const handleGenerate = async (
    streamId: string,
    type: 'blog' | 'snippets' | 'chapters'
  ) => {
    setGeneratingFor((prev) => ({ ...prev, [streamId]: type }));
    try {
      let updated: StreamContent;
      switch (type) {
        case 'blog':
          updated = await contentPipelineService.generateBlogDraft(streamId);
          break;
        case 'snippets':
          updated = await contentPipelineService.generateCodeSnippets(streamId);
          break;
        case 'chapters':
          updated = await contentPipelineService.generateChapters(streamId);
          break;
      }

      setStreams((prev) =>
        prev.map((s) =>
          s.stream.id === streamId
            ? { ...s, content: updated, status: getContentStatus(updated) }
            : s
        )
      );
    } catch (err) {
      console.error(`Failed to generate ${type}:`, err);
    } finally {
      setGeneratingFor((prev) => {
        const next = { ...prev };
        delete next[streamId];
        return next;
      });
    }
  };

  const handleExport = async (
    streamId: string,
    format: 'markdown' | 'html'
  ) => {
    try {
      const data = await contentPipelineService.exportContent(streamId, format);
      const blob = new Blob([data], {
        type: format === 'html' ? 'text/html' : 'text/markdown',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stream-content.${format === 'html' ? 'html' : 'md'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold mb-2">Sign in required</h2>
        <p className="text-muted-foreground mb-4">
          You need to be signed in to access the content pipeline.
        </p>
        <Button asChild>
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Content Pipeline
        </h1>
        <p className="text-muted-foreground">
          Stream once, get multiple content assets. Generate blog posts, code
          snippets, transcripts, and chapter markers from your streams.
        </p>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-primary/10">
              <Video className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Streams</p>
              <p className="text-2xl font-bold">
                {isLoading ? (
                  <Skeleton className="h-8 w-8 inline-block" />
                ) : (
                  streams.length
                )}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <FileText className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Content Generated</p>
              <p className="text-2xl font-bold">
                {isLoading ? (
                  <Skeleton className="h-8 w-8 inline-block" />
                ) : (
                  streams.filter((s) => s.status === 'generated').length
                )}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">
                {isLoading ? (
                  <Skeleton className="h-8 w-8 inline-block" />
                ) : (
                  streams.filter((s) => s.status === 'pending').length
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stream list */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Your Streams</h2>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <ContentRowSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <Card className="border-border">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-10 h-10 mx-auto mb-3 text-destructive" />
              <p className="text-muted-foreground">{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : streams.length === 0 ? (
          <Card className="border-border">
            <CardContent className="p-8 text-center">
              <Video className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">
                No streams yet. Start streaming to generate content.
              </p>
              <Button asChild className="mt-4">
                <Link href="/dashboard/go-live">Go Live</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          streams.map(({ stream, content, status }) => {
            const isGenerating = !!generatingFor[stream.id];
            const generatingType = generatingFor[stream.id];

            return (
              <Card key={stream.id} className="border-border hover:border-brand-primary/40 transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Stream info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/dashboard/content/${stream.id}`}
                        className="font-medium hover:text-brand-primary transition-colors truncate block"
                      >
                        {stream.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {stream.startedAt
                            ? new Date(stream.startedAt).toLocaleDateString(
                                'en-US',
                                {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                }
                              )
                            : 'Draft'}
                        </span>
                        {stream.category && (
                          <>
                            <span className="mx-1">-</span>
                            <span>{stream.category.name}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    <StatusBadge status={status} />

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isGenerating}
                        onClick={() => handleGenerate(stream.id, 'blog')}
                        className="text-xs"
                      >
                        {generatingType === 'blog' ? (
                          <Sparkles className="w-3.5 h-3.5 mr-1 animate-pulse" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 mr-1" />
                        )}
                        Blog
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isGenerating}
                        onClick={() => handleGenerate(stream.id, 'snippets')}
                        className="text-xs"
                      >
                        {generatingType === 'snippets' ? (
                          <Sparkles className="w-3.5 h-3.5 mr-1 animate-pulse" />
                        ) : (
                          <Code2 className="w-3.5 h-3.5 mr-1" />
                        )}
                        Snippets
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link href={`/dashboard/content/${stream.id}`}>
                          <BookOpen className="w-3.5 h-3.5 mr-1" />
                          View
                        </Link>
                      </Button>
                      {status === 'generated' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExport(stream.id, 'markdown')}
                          className="text-xs"
                        >
                          <Download className="w-3.5 h-3.5 mr-1" />
                          Export
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
