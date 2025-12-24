'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { StreamSetupForm } from '@/components/stream-setup-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { streamsService } from '@/services/streams';
import type { Stream } from '@/types';
import { Copy, Eye, EyeOff, Radio, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function GoLivePage() {
  return (
    <ProtectedRoute>
      <GoLiveContent />
    </ProtectedRoute>
  );
}

function GoLiveContent() {
  const router = useRouter();
  const [stream, setStream] = useState<Stream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStreamKey, setShowStreamKey] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const RTMP_INGEST_URL = 'rtmp://live.cloudflarestream.com/live';

  // Create stream on mount
  useEffect(() => {
    const createStream = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const newStream = await streamsService.create({ title: 'New Stream' });
        setStream(newStream);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create stream');
      } finally {
        setIsLoading(false);
      }
    };

    createStream();
  }, []);

  const handleCopy = async (text: string, type: 'url' | 'key') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'url') {
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
      } else {
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleStartStream = async () => {
    if (!stream) return;

    try {
      setIsStarting(true);
      setError(null);
      await streamsService.start(stream.id);
      // Navigate to stream page
      router.push(`/stream/${stream.user.username}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start stream');
    } finally {
      setIsStarting(false);
    }
  };

  const handleUpdateStream = async (data: { title: string; description?: string; categoryId?: string; tags?: string[] }) => {
    if (!stream) return;

    try {
      const updatedStream = await streamsService.update(stream.id, data);
      setStream(updatedStream);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update stream');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-gradient-to-b from-background to-card/30">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Go Live</h1>
            <p className="text-muted-foreground">Set up your stream and start broadcasting</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
                <p className="text-sm text-muted-foreground">Preparing your stream...</p>
              </div>
            </div>
          ) : stream ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Stream Configuration */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Stream Configuration</CardTitle>
                    <CardDescription>Configure your stream details before going live</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <StreamSetupForm
                      initialData={{
                        title: stream.title,
                        description: stream.description || '',
                        categoryId: stream.categoryId || '',
                        tags: stream.tags.map(t => t.name),
                      }}
                      onSubmit={handleUpdateStream}
                    />
                  </CardContent>
                </Card>

                {/* RTMP Settings */}
                <Card className="border-border border-brand-primary/30">
                  <CardHeader>
                    <CardTitle>RTMP Settings</CardTitle>
                    <CardDescription>
                      Configure your streaming software (OBS, Streamlabs, etc.) with these credentials
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* RTMP URL */}
                    <div className="space-y-2">
                      <Label htmlFor="rtmp-url">RTMP Ingest URL</Label>
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <Input
                            id="rtmp-url"
                            value={RTMP_INGEST_URL}
                            readOnly
                            className="font-mono text-sm pr-10 bg-muted"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleCopy(RTMP_INGEST_URL, 'url')}
                          className="flex-shrink-0"
                        >
                          {copiedUrl ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Stream Key */}
                    <div className="space-y-2">
                      <Label htmlFor="stream-key">Stream Key</Label>
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <Input
                            id="stream-key"
                            type={showStreamKey ? 'text' : 'password'}
                            value={stream.streamKey || 'No stream key available'}
                            readOnly
                            className="font-mono text-sm pr-20 bg-muted"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowStreamKey(!showStreamKey)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                            type="button"
                          >
                            {showStreamKey ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleCopy(stream.streamKey || '', 'key')}
                          disabled={!stream.streamKey}
                          className="flex-shrink-0"
                        >
                          {copiedKey ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Keep your stream key private. Never share it with anyone.
                      </p>
                    </div>

                    {/* Code block style display */}
                    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                      <p className="text-sm font-medium text-muted-foreground">Quick Setup</p>
                      <div className="space-y-2 text-xs font-mono">
                        <div>
                          <span className="text-muted-foreground">Server:</span>{' '}
                          <span className="text-brand-primary">{RTMP_INGEST_URL}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Stream Key:</span>{' '}
                          <span className="text-brand-primary">
                            {showStreamKey ? stream.streamKey : '••••••••••••••••'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Start Streaming */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Ready to Go Live?</CardTitle>
                    <CardDescription>
                      Make sure your streaming software is connected before starting
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={handleStartStream}
                      disabled={isStarting || !stream.streamKey}
                    >
                      {isStarting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <Radio className="w-5 h-5 mr-2" />
                          Start Stream
                        </>
                      )}
                    </Button>

                    {stream.status === 'live' && (
                      <div className="space-y-3">
                        <Badge variant="destructive" className="w-full justify-center py-2 font-medium">
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse mr-2" />
                          YOU ARE LIVE
                        </Badge>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => router.push(`/stream/${stream.user.username}`)}
                        >
                          Go to Stream
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Setup Instructions */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Setup Instructions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex gap-2">
                      <span className="text-brand-primary font-medium">1.</span>
                      <p>Open your streaming software (OBS, Streamlabs, etc.)</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-brand-primary font-medium">2.</span>
                      <p>Copy the RTMP Ingest URL to the Server field</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-brand-primary font-medium">3.</span>
                      <p>Copy the Stream Key to the Stream Key field</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-brand-primary font-medium">4.</span>
                      <p>Configure your stream settings (title, category, tags)</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-brand-primary font-medium">5.</span>
                      <p>Start streaming in your software</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-brand-primary font-medium">6.</span>
                      <p>Click "Start Stream" to go live on AINative Studio</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Tips */}
                <Card className="border-border border-brand-primary/30">
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex gap-2">
                      <span className="text-brand-primary">→</span>
                      <p>Test your stream before going live</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-brand-primary">→</span>
                      <p>Use a clear, descriptive title</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-brand-primary">→</span>
                      <p>Select the right category for visibility</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-brand-primary">→</span>
                      <p>Add relevant tags to reach your audience</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-brand-primary">→</span>
                      <p>Keep your stream key private and secure</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}
