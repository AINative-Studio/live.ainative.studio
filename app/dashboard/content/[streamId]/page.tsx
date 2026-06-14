'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';
import { contentPipelineService } from '@/services/content-pipeline';
import type { StreamContent, CodeSnippet, TranscriptSegment, ContentChapter } from '@/types';
import {
  FileText,
  Code2,
  BookOpen,
  Download,
  Sparkles,
  ArrowLeft,
  Clock,
  Copy,
  Check,
  AlertCircle,
  ListOrdered,
} from 'lucide-react';

function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may not be available
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleCopy} className="text-xs">
      {copied ? (
        <Check className="w-3.5 h-3.5 mr-1" />
      ) : (
        <Copy className="w-3.5 h-3.5 mr-1" />
      )}
      {copied ? 'Copied' : 'Copy'}
    </Button>
  );
}

function BlogDraftTab({
  blogDraft,
  isGenerating,
  onGenerate,
}: {
  blogDraft: string | null;
  isGenerating: boolean;
  onGenerate: () => void;
}) {
  if (!blogDraft) {
    return (
      <Card className="border-border">
        <CardContent className="p-8 text-center">
          <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">
            No blog draft generated yet for this stream.
          </p>
          <Button onClick={onGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            {isGenerating ? 'Generating...' : 'Generate Blog Draft'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg">Blog Draft</CardTitle>
        <div className="flex gap-2">
          <CopyButton text={blogDraft} />
          <Button onClick={onGenerate} variant="outline" size="sm" disabled={isGenerating}>
            {isGenerating ? (
              <Sparkles className="w-3.5 h-3.5 mr-1 animate-pulse" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 mr-1" />
            )}
            Regenerate
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-invert prose-sm max-w-none rounded-lg bg-card p-6 border border-border">
          {/* Render blog draft as plain text with paragraph breaks */}
          {blogDraft.split('\n\n').map((paragraph, i) => {
            if (paragraph.startsWith('# ')) {
              return (
                <h1 key={i} className="text-xl font-bold mt-4 mb-2">
                  {paragraph.slice(2)}
                </h1>
              );
            }
            if (paragraph.startsWith('## ')) {
              return (
                <h2 key={i} className="text-lg font-semibold mt-4 mb-2">
                  {paragraph.slice(3)}
                </h2>
              );
            }
            if (paragraph.startsWith('### ')) {
              return (
                <h3 key={i} className="text-base font-semibold mt-3 mb-1">
                  {paragraph.slice(4)}
                </h3>
              );
            }
            if (paragraph.startsWith('```')) {
              return (
                <pre
                  key={i}
                  className="bg-dark-1 rounded-md p-4 overflow-x-auto text-sm font-mono my-3"
                >
                  <code>{paragraph.replace(/```\w*\n?/, '').replace(/```$/, '')}</code>
                </pre>
              );
            }
            return (
              <p key={i} className="mb-3 leading-relaxed">
                {paragraph}
              </p>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function CodeSnippetsTab({
  snippets,
  isGenerating,
  onGenerate,
}: {
  snippets: CodeSnippet[];
  isGenerating: boolean;
  onGenerate: () => void;
}) {
  if (snippets.length === 0) {
    return (
      <Card className="border-border">
        <CardContent className="p-8 text-center">
          <Code2 className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">
            No code snippets extracted yet.
          </p>
          <Button onClick={onGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            {isGenerating ? 'Generating...' : 'Generate Code Snippets'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {snippets.length} snippet{snippets.length !== 1 ? 's' : ''} extracted
        </p>
        <Button onClick={onGenerate} variant="outline" size="sm" disabled={isGenerating}>
          {isGenerating ? (
            <Sparkles className="w-3.5 h-3.5 mr-1 animate-pulse" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 mr-1" />
          )}
          Regenerate
        </Button>
      </div>

      {snippets.map((snippet, i) => (
        <Card key={i} className="border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">
                  {snippet.language}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {formatTimestamp(snippet.timestamp)}
                </span>
              </div>
              <CopyButton text={snippet.code} />
            </div>
          </CardHeader>
          <CardContent>
            <pre className="bg-dark-1 rounded-md p-4 overflow-x-auto text-sm font-mono mb-3">
              <code>{snippet.code}</code>
            </pre>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {snippet.explanation}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TranscriptTab({
  segments,
  isLoading,
}: {
  segments: TranscriptSegment[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-5 w-14 shrink-0" />
            <Skeleton className="h-5 flex-1" />
          </div>
        ))}
      </div>
    );
  }

  if (segments.length === 0) {
    return (
      <Card className="border-border">
        <CardContent className="p-8 text-center">
          <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">
            No transcript available for this stream.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardContent className="p-4 max-h-[600px] overflow-y-auto">
        <div className="space-y-3">
          {segments.map((segment, i) => (
            <div key={i} className="flex gap-3 group">
              <span className="text-xs text-brand-primary font-mono shrink-0 pt-0.5 w-14 text-right">
                {formatTimestamp(segment.startTime)}
              </span>
              <div className="flex-1">
                {segment.speaker && (
                  <span className="text-xs font-semibold text-muted-foreground mr-2">
                    {segment.speaker}:
                  </span>
                )}
                <span className="text-sm leading-relaxed">{segment.text}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ChaptersTab({ chapters }: { chapters: ContentChapter[] }) {
  if (chapters.length === 0) {
    return (
      <Card className="border-border">
        <CardContent className="p-8 text-center">
          <ListOrdered className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">
            No chapter markers available for this stream.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardContent className="p-4">
        <div className="space-y-3">
          {chapters.map((chapter, i) => (
            <div
              key={i}
              className="flex gap-3 p-3 rounded-lg hover:bg-card/80 transition-colors border border-transparent hover:border-border"
            >
              <div className="text-xs text-brand-primary font-mono shrink-0 pt-0.5 w-14 text-right">
                {formatTimestamp(chapter.startTime)}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">{chapter.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {chapter.summary}
                </p>
                <span className="text-xs text-muted-foreground mt-1 inline-block">
                  {formatTimestamp(chapter.startTime)} -{' '}
                  {formatTimestamp(chapter.endTime)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function StreamContentDetailPage() {
  const params = useParams();
  const streamId = params.streamId as string;
  const { isAuthenticated } = useAuth();

  const [content, setContent] = useState<StreamContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTranscriptLoading, setIsTranscriptLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatingBlog, setGeneratingBlog] = useState(false);
  const [generatingSnippets, setGeneratingSnippets] = useState(false);

  useEffect(() => {
    async function fetchContent() {
      if (!streamId || !isAuthenticated) return;
      setIsLoading(true);
      setError(null);

      try {
        const data = await contentPipelineService.getStreamContent(streamId);
        setContent(data);
      } catch (err: any) {
        // 404 is expected if no content generated yet
        if (err?.status !== 404) {
          setError(err?.message || 'Failed to load content');
        }
        setContent(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchContent();
  }, [streamId, isAuthenticated]);

  const handleGenerateBlog = async () => {
    setGeneratingBlog(true);
    try {
      const updated = await contentPipelineService.generateBlogDraft(streamId);
      setContent(updated);
    } catch (err) {
      console.error('Failed to generate blog draft:', err);
    } finally {
      setGeneratingBlog(false);
    }
  };

  const handleGenerateSnippets = async () => {
    setGeneratingSnippets(true);
    try {
      const updated = await contentPipelineService.generateCodeSnippets(streamId);
      setContent(updated);
    } catch (err) {
      console.error('Failed to generate snippets:', err);
    } finally {
      setGeneratingSnippets(false);
    }
  };

  const handleExport = async (format: 'markdown' | 'html') => {
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
          You need to be signed in to view stream content.
        </p>
        <Button asChild>
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/content"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Content Pipeline
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Stream Content
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Stream ID: {streamId}
              {content?.generatedAt && (
                <span className="ml-3">
                  Generated:{' '}
                  {new Date(content.generatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('markdown')}
            >
              <Download className="w-4 h-4 mr-1" />
              Markdown
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('html')}
            >
              <Download className="w-4 h-4 mr-1" />
              HTML
            </Button>
          </div>
        </div>
      </div>

      {/* Summary */}
      {content?.summary && (
        <Card className="border-border mb-6">
          <CardContent className="p-4">
            <p className="text-sm leading-relaxed">{content.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Content Tabs */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <Tabs defaultValue="blog" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="blog" className="flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              Blog Draft
            </TabsTrigger>
            <TabsTrigger value="snippets" className="flex items-center gap-1.5">
              <Code2 className="w-4 h-4" />
              Code Snippets
              {content?.codeSnippets && content.codeSnippets.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {content.codeSnippets.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="transcript" className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              Transcript
            </TabsTrigger>
            <TabsTrigger value="chapters" className="flex items-center gap-1.5">
              <ListOrdered className="w-4 h-4" />
              Chapters
              {content?.chapters && content.chapters.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {content.chapters.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value="blog">
              <BlogDraftTab
                blogDraft={content?.blogDraft ?? null}
                isGenerating={generatingBlog}
                onGenerate={handleGenerateBlog}
              />
            </TabsContent>

            <TabsContent value="snippets">
              <CodeSnippetsTab
                snippets={content?.codeSnippets ?? []}
                isGenerating={generatingSnippets}
                onGenerate={handleGenerateSnippets}
              />
            </TabsContent>

            <TabsContent value="transcript">
              <TranscriptTab
                segments={content?.transcript ?? []}
                isLoading={isTranscriptLoading}
              />
            </TabsContent>

            <TabsContent value="chapters">
              <ChaptersTab chapters={content?.chapters ?? []} />
            </TabsContent>
          </div>
        </Tabs>
      )}
    </div>
  );
}
